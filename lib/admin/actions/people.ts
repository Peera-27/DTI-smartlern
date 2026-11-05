"use server";

import { prisma } from "@/lib/prisma";
import { ActionError, adminAction } from "../action";
import { certificateIdSchema, enrollByEmailSchema, enrollmentSchema, setRoleSchema, userIdSchema } from "../schemas";

// ---------- ผู้ใช้ ----------

/** ห้ามแก้ตัวเอง กันแอดมินลดสิทธิ์ตัวเองจนไม่เหลือใครเข้า /admin ได้ */
function notSelf(id: string, admin: { id: string }) {
  if (id === admin.id) throw new ActionError("แก้สิทธิ์หรือลบบัญชีของตัวเองไม่ได้");
}

export const setUserRole = adminAction(setRoleSchema, async ({ id, role }, admin) => {
  notSelf(id, admin);
  await prisma.user.update({ where: { id }, data: { role } });
  return null;
});

/** ลบบัญชี: cascade ลบการลงทะเบียน ความคืบหน้า ผลสอบ และใบประกาศของคนนั้นทั้งหมด */
export const deleteUser = adminAction(userIdSchema, async ({ id }, admin) => {
  notSelf(id, admin);
  await prisma.user.delete({ where: { id } });
  return null;
});

// ---------- ผู้เรียนในคอร์ส ----------

export const enrollByEmail = adminAction(enrollByEmailSchema, async ({ courseId, email }) => {
  const user = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (!user) throw new ActionError(`ไม่พบผู้ใช้ ${email} (ต้องสมัครสมาชิกก่อน)`);
  await prisma.enrollment.upsert({
    where: { userId_courseId: { userId: user.id, courseId } },
    create: { userId: user.id, courseId },
    update: {},
  });
  return null;
});

/** ล้างความคืบหน้า ผลสอบ และใบประกาศของผู้เรียนในคอร์สนี้ (ใช้ร่วมกับถอนออกและยกเลิกใบประกาศ) */
async function resetCourseProgress(userId: string, courseId: string, removeEnrollment: boolean) {
  await prisma.$transaction([
    prisma.lessonProgress.deleteMany({ where: { userId, lesson: { courseId } } }),
    prisma.quizAttempt.deleteMany({ where: { userId, quiz: { lesson: { courseId } } } }),
    prisma.certificate.deleteMany({ where: { userId, courseId } }),
    removeEnrollment
      ? prisma.enrollment.deleteMany({ where: { userId, courseId } })
      : prisma.enrollment.updateMany({ where: { userId, courseId }, data: { completedAt: null } }),
  ]);
}

export const removeEnrollment = adminAction(enrollmentSchema, async ({ courseId, userId }) => {
  await resetCourseProgress(userId, courseId, true);
  return null;
});

// ---------- ใบประกาศ ----------

/**
 * ยกเลิกใบประกาศ: ล้างความคืบหน้าในคอร์สด้วย ไม่อย่างนั้นผู้เรียนกด "เรียนจบบทนี้" อีกครั้งก็ได้ใบใหม่ทันที
 * ผู้เรียนยังลงทะเบียนอยู่และต้องเรียนใหม่
 */
export const revokeCertificate = adminAction(certificateIdSchema, async ({ id }) => {
  const cert = await prisma.certificate.findUnique({ where: { id }, select: { userId: true, courseId: true } });
  if (!cert) throw new ActionError("ไม่พบใบประกาศ");
  await resetCourseProgress(cert.userId, cert.courseId, false);
  return null;
});
