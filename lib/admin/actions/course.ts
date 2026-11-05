"use server";

import { prisma } from "@/lib/prisma";
import { ActionError, adminAction } from "../action";
import { findPublishProblems, invalidateCourse, toJson } from "../helpers";
import { createCourseSchema, deleteCourseSchema, setPublishedSchema, updateCourseSchema } from "../schemas";

/** สร้างคอร์สใหม่ (เริ่มต้นเป็นฉบับร่าง published = false) */
export const createCourse = adminAction(createCourseSchema, async (input) => {
  const course = await prisma.course.create({
    data: { ...input, description: toJson(input.description) },
    select: { id: true, slug: true },
  });
  return course;
});

/** แก้ไขคอร์ส ส่งมาเฉพาะ field ที่เปลี่ยนก็ได้ */
export const updateCourse = adminAction(updateCourseSchema, async ({ id, description, ...rest }) => {
  const before = await prisma.course.findUnique({ where: { id }, select: { slug: true } });
  if (!before) throw new ActionError("ไม่พบคอร์ส");

  const course = await prisma.course.update({
    where: { id },
    data: { ...rest, description: toJson(description) },
    select: { id: true, slug: true },
  });
  // ถ้าเปลี่ยน slug ต้องล้างทั้งหน้าเก่าและหน้าใหม่
  invalidateCourse(before.slug, course.slug);
  return course;
});

/** เผยแพร่ / ยกเลิกเผยแพร่ ตอนเผยแพร่จะเช็คว่าเนื้อหาครบก่อน */
export const setCoursePublished = adminAction(setPublishedSchema, async ({ id, published }) => {
  if (published) {
    const problems = await findPublishProblems(id);
    if (problems.length) throw new ActionError(`ยังเผยแพร่ไม่ได้:\n- ${problems.join("\n- ")}`);
  }
  const course = await prisma.course.update({ where: { id }, data: { published }, select: { id: true, slug: true, published: true } });
  invalidateCourse(course.slug);
  return course;
});

/**
 * ลบคอร์ส: onDelete: Cascade จะลบการลงทะเบียน ความคืบหน้า ผลสอบ และใบประกาศของผู้เรียนไปด้วย
 * ถ้ามีผู้เรียนแล้วต้องส่ง confirmTitle ตรงกับชื่อคอร์สเพื่อยืนยัน
 */
export const deleteCourse = adminAction(deleteCourseSchema, async ({ id, confirmTitle }) => {
  const course = await prisma.course.findUnique({
    where: { id },
    select: { slug: true, title: true, _count: { select: { enrollments: true, certificates: true } } },
  });
  if (!course) throw new ActionError("ไม่พบคอร์ส");
  const { enrollments, certificates } = course._count;
  if ((enrollments || certificates) && confirmTitle !== course.title) {
    throw new ActionError(
      `คอร์สนี้มีผู้ลงทะเบียน ${enrollments} คน / ใบประกาศ ${certificates} ใบ ซึ่งจะถูกลบทั้งหมด พิมพ์ชื่อคอร์สให้ตรงเพื่อยืนยัน`,
    );
  }
  await prisma.course.delete({ where: { id } });
  invalidateCourse(course.slug);
  return null;
});
