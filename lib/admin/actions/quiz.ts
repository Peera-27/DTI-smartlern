"use server";

import { prisma } from "@/lib/prisma";
import { ActionError, adminAction } from "../action";
import { invalidateCourse } from "../helpers";
import { saveQuizSchema } from "../schemas";

/**
 * บันทึกแบบทดสอบทั้งชุดของบทเรียนชนิด QUIZ (แทนที่คำถามเดิมทั้งหมด)
 *
 * หมายเหตุ: คำถาม/ตัวเลือกจะได้ id ใหม่ คำตอบใน QuizAttempt เก่าจึงชี้ไป id ที่ไม่มีแล้ว
 * (คะแนนกับผลผ่าน/ไม่ผ่านที่บันทึกไว้ยังอยู่ครบ)
 */
export const saveQuiz = adminAction(saveQuizSchema, async ({ lessonId, passingScore, questions }) => {
  const slug = await prisma.$transaction(async (tx) => {
    const lesson = await tx.lesson.findUnique({
      where: { id: lessonId },
      select: { type: true, course: { select: { slug: true } } },
    });
    if (!lesson) throw new ActionError("ไม่พบบทเรียน");
    if (lesson.type !== "QUIZ") throw new ActionError("บทเรียนนี้ไม่ใช่แบบทดสอบ");

    const quiz = await tx.quiz.upsert({
      where: { lessonId },
      update: { passingScore },
      create: { lessonId, passingScore },
      select: { id: true },
    });

    await tx.question.deleteMany({ where: { quizId: quiz.id } }); // ตัวเลือกถูกลบตาม cascade
    const created = await tx.question.createManyAndReturn({
      data: questions.map((q, i) => ({ quizId: quiz.id, position: i + 1, text: q.text, explanation: q.explanation ?? null })),
      select: { id: true, position: true },
    });
    // จับคู่ด้วย position เพราะลำดับที่ DB คืนมาไม่รับประกัน
    const idAt = new Map(created.map((c) => [c.position, c.id]));
    await tx.option.createMany({
      data: questions.flatMap((q, i) => q.options.map((o) => ({ questionId: idAt.get(i + 1)!, text: o.text, isCorrect: o.isCorrect }))),
    });
    return lesson.course.slug;
  });

  invalidateCourse(slug);
  return null;
});
