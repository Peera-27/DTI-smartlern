"use server";

import { refresh } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { gradeQuiz } from "./grade";

async function requireUserId() {
  const id = (await auth())?.user?.id;
  if (!id) throw new Error("กรุณาเข้าสู่ระบบ");
  return id;
}

/** บทเรียนต้องอยู่ในคอร์สที่เผยแพร่และผู้ใช้ลงทะเบียนแล้ว */
async function requireEnrolledLesson(lessonId: string) {
  const userId = await requireUserId();
  const lesson = await prisma.lesson.findFirst({
    where: { id: lessonId, course: { published: true, enrollments: { some: { userId } } } },
    select: { id: true, type: true, courseId: true },
  });
  if (!lesson) throw new Error("ไม่พบบทเรียน หรือยังไม่ได้ลงทะเบียนคอร์สนี้");
  return { userId, lesson };
}

/** บันทึกว่าเรียนจบบท ถ้าครบทุกบทแล้วจะปิดคอร์สและออกใบประกาศ */
async function markDone(userId: string, lessonId: string, courseId: string) {
  await prisma.lessonProgress.upsert({
    where: { userId_lessonId: { userId, lessonId } },
    create: { userId, lessonId, completedAt: new Date() },
    update: {},
  });
  const [total, done] = await Promise.all([
    prisma.lesson.count({ where: { courseId } }),
    prisma.lessonProgress.count({ where: { userId, completedAt: { not: null }, lesson: { courseId } } }),
  ]);
  if (done < total) return;
  await prisma.$transaction([
    prisma.enrollment.updateMany({ where: { userId, courseId, completedAt: null }, data: { completedAt: new Date() } }),
    prisma.certificate.upsert({
      where: { userId_courseId: { userId, courseId } },
      create: { userId, courseId, code: crypto.randomUUID() },
      update: {},
    }),
  ]);
}

export async function enroll(courseId: string) {
  const userId = await requireUserId();
  const course = await prisma.course.findFirst({ where: { id: courseId, published: true }, select: { id: true } });
  if (!course) throw new Error("ไม่พบคอร์ส");
  await prisma.enrollment.upsert({
    where: { userId_courseId: { userId, courseId } },
    create: { userId, courseId },
    update: {},
  });
  refresh();
}

export async function completeLesson(lessonId: string) {
  const { userId, lesson } = await requireEnrolledLesson(lessonId);
  if (lesson.type === "QUIZ") throw new Error("บทนี้ต้องทำแบบทดสอบให้ผ่าน");
  await markDone(userId, lesson.id, lesson.courseId);
  refresh();
}

/** ฟอร์มส่งมาเป็น name = questionId, value = optionId คิดคะแนนที่เซิร์ฟเวอร์เท่านั้น */
export async function submitQuiz(lessonId: string, form: FormData) {
  const { userId, lesson } = await requireEnrolledLesson(lessonId);
  const quiz = await prisma.quiz.findUnique({
    where: { lessonId },
    select: { id: true, passingScore: true, questions: { select: { id: true, options: { select: { id: true, isCorrect: true } } } } },
  });
  if (!quiz?.questions.length) throw new Error("ไม่พบแบบทดสอบ");

  const answers: Record<string, string> = {};
  for (const q of quiz.questions) {
    const v = form.get(q.id);
    if (typeof v === "string" && v) answers[q.id] = v;
  }
  const score = gradeQuiz(quiz.questions, answers);
  const passed = score >= quiz.passingScore;

  await prisma.quizAttempt.create({ data: { userId, quizId: quiz.id, score, passed, answers } });
  if (passed) await markDone(userId, lesson.id, lesson.courseId);
  refresh();
}
