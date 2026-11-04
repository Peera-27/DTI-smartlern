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
    for (const [i, q] of questions.entries()) {
      await tx.question.create({
        data: {
          quizId: quiz.id,
          position: i + 1,
          text: q.text,
          explanation: q.explanation ?? null,
          options: { create: q.options.map((o) => ({ text: o.text, isCorrect: o.isCorrect })) },
        },
      });
    }
    return lesson.course.slug;
  }, { timeout: 20_000 }); // คำถามเยอะ + DB บน Neon อาจเกิน 5 วินาทีที่เป็นค่าเริ่มต้น

  invalidateCourse(slug);
  return null;
});
