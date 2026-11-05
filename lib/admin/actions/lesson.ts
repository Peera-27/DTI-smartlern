"use server";

import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ActionError, adminAction } from "../action";
import { applyLessonOrder, assertStillPublishable, getCourseSlug, invalidateCourse, renumberLessons, toJson } from "../helpers";
import { createLessonSchema, lessonBodySchema, lessonIdSchema, reorderLessonsSchema, updateLessonSchema } from "../schemas";

/** แปลง lesson จาก schema เป็นข้อมูลที่บันทึก: field ที่ไม่ใช้กับชนิดนั้นจะถูกล้างเป็น null */
function lessonData(l: z.output<typeof lessonBodySchema>) {
  return {
    title: l.title,
    type: l.type,
    attachmentUrl: l.attachmentUrl ?? null,
    youtubeId: l.type === "VIDEO" ? l.youtubeId : null,
    content: l.type === "QUIZ" ? Prisma.DbNull : (toJson(l.content) ?? Prisma.DbNull),
  };
}

/** เพิ่มบทเรียนต่อท้ายคอร์ส ถ้าเป็น QUIZ จะสร้างแบบทดสอบเปล่าให้ด้วย (เพิ่มคำถามด้วย saveQuiz) */
export const createLesson = adminAction(createLessonSchema, async ({ courseId, lesson }) => {
  const slug = await getCourseSlug(courseId);

  // position = max + 1 ถ้ามีคนเพิ่มพร้อมกันจะชน unique (P2002) จึงลองใหม่ได้ 3 ครั้ง
  for (let attempt = 0; ; attempt++) {
    try {
      const created = await prisma.$transaction(async (tx) => {
        const { _max } = await tx.lesson.aggregate({ where: { courseId }, _max: { position: true } });
        return tx.lesson.create({
          data: {
            courseId,
            position: (_max.position ?? 0) + 1,
            ...lessonData(lesson),
            ...(lesson.type === "QUIZ" && { quiz: { create: {} } }),
          },
          select: { id: true, position: true },
        });
      });
      invalidateCourse(slug);
      return created;
    } catch (e) {
      const conflict = e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002";
      if (!conflict || attempt >= 2) throw e;
    }
  }
});

/** แก้ไขบทเรียน ถ้าเปลี่ยนชนิดออกจาก QUIZ แบบทดสอบเดิมจะถูกลบ */
export const updateLesson = adminAction(updateLessonSchema, async ({ id, lesson }) => {
  const updated = await prisma.$transaction(async (tx) => {
    const current = await tx.lesson.findUnique({
      where: { id },
      select: {
        courseId: true,
        course: { select: { slug: true } },
        quiz: { select: { id: true, _count: { select: { attempts: true } } } },
      },
    });
    if (!current) throw new ActionError("ไม่พบบทเรียน");

    if (lesson.type !== "QUIZ" && current.quiz) {
      // ลบ quiz = ลบผลสอบของผู้เรียนตาม cascade
      if (current.quiz._count.attempts) throw new ActionError(`เปลี่ยนชนิดไม่ได้: มีผลสอบของผู้เรียน ${current.quiz._count.attempts} ครั้ง`);
      await tx.quiz.delete({ where: { id: current.quiz.id } });
    }
    if (lesson.type === "QUIZ" && !current.quiz) await tx.quiz.create({ data: { lessonId: id } });

    await tx.lesson.update({ where: { id }, data: lessonData(lesson) });
    await assertStillPublishable(tx, current.courseId);
    return { id, slug: current.course.slug };
  });
  invalidateCourse(updated.slug);
  return { id: updated.id };
});

/** ลบบทเรียน แล้วเรียงเลขบทที่เหลือใหม่ให้ต่อเนื่อง */
export const deleteLesson = adminAction(lessonIdSchema, async ({ id }) => {
  const slug = await prisma.$transaction(async (tx) => {
    const lesson = await tx.lesson.findUnique({
      where: { id },
      select: {
        courseId: true,
        course: { select: { slug: true } },
        _count: { select: { progress: true } },
        quiz: { select: { _count: { select: { attempts: true } } } },
      },
    });
    if (!lesson) throw new ActionError("ไม่พบบทเรียน");
    // เหมือน deleteCourse: cascade จะลบความคืบหน้าและผลสอบของผู้เรียนไปด้วย
    if (lesson._count.progress || lesson.quiz?._count.attempts) {
      throw new ActionError("ลบไม่ได้: มีผู้เรียนเริ่มบทนี้หรือทำแบบทดสอบแล้ว");
    }
    await tx.lesson.delete({ where: { id } });
    await renumberLessons(tx, lesson.courseId);
    await assertStillPublishable(tx, lesson.courseId);
    return lesson.course.slug;
  });
  invalidateCourse(slug);
  return null;
});

/** จัดลำดับบทเรียนใหม่ ต้องส่ง id ของทุกบทในคอร์สมาครบ เรียงตามลำดับที่ต้องการ */
export const reorderLessons = adminAction(reorderLessonsSchema, async ({ courseId, lessonIds }) => {
  const slug = await getCourseSlug(courseId);
  await prisma.$transaction(async (tx) => {
    const existing = await tx.lesson.findMany({ where: { courseId }, select: { id: true } });
    const given = new Set(lessonIds);
    if (existing.length !== lessonIds.length || existing.some((l) => !given.has(l.id))) {
      throw new ActionError("รายการบทเรียนไม่ตรงกับในคอร์ส กรุณารีเฟรชหน้าแล้วลองใหม่");
    }
    await applyLessonOrder(tx, courseId, lessonIds);
  });
  invalidateCourse(slug);
  return null;
});
