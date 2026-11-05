"use server";

import { redirect } from "next/navigation";
import type { z } from "zod";
import type { ActionResult } from "@/lib/admin/action";
import { createCourse, deleteCourse, setCoursePublished, updateCourse } from "@/lib/admin/actions/course";
import { createLesson, deleteLesson, reorderLessons, updateLesson } from "@/lib/admin/actions/lesson";
import { deleteUser, enrollByEmail, removeEnrollment, revokeCertificate, setUserRole } from "@/lib/admin/actions/people";
import { saveQuiz } from "@/lib/admin/actions/quiz";
import type { lessonBodySchema } from "@/lib/admin/schemas";
import { textToDoc } from "@/lib/admin/text";

// ตัวเชื่อมฟอร์ม HTML -> action ของแอดมิน (ซึ่งเช็คสิทธิ์และ validate อยู่แล้ว)
// ผลลัพธ์ส่งกลับผ่าน query string (?error= / ?done=) หน้าแอดมินจึงไม่ต้องมี JavaScript ฝั่ง client

const str = (f: FormData, k: string) => String(f.get(k) ?? "").trim();
const orNull = (v: string) => v || null;

async function finish<T>(result: ActionResult<T>, back: string, done?: string | ((data: T) => string)) {
  if (!result.ok) {
    const details = Object.entries(result.fieldErrors ?? {}).flatMap(([, msgs]) => msgs);
    const message = [result.error, ...details].join("\n");
    redirect(`${back}?error=${encodeURIComponent(message)}`);
  }
  if (typeof done === "function") redirect(done(result.data));
  redirect(done ? `${back}?done=${encodeURIComponent(done)}` : back);
}

function courseFromForm(f: FormData) {
  const duration = str(f, "durationMin");
  return {
    title: str(f, "title"),
    slug: str(f, "slug"),
    summary: str(f, "summary"),
    description: textToDoc(str(f, "description")),
    coverImage: orNull(str(f, "coverImage")),
    instructor: orNull(str(f, "instructor")),
    durationMin: duration ? Number(duration) : null,
  };
}

function lessonFromForm(f: FormData) {
  // ส่งครบทุก field แล้วให้ Zod (discriminatedUnion) เลือกใช้ตามชนิด
  return {
    type: str(f, "type"),
    title: str(f, "title"),
    youtubeId: str(f, "youtubeId"),
    attachmentUrl: orNull(str(f, "attachmentUrl")),
    content: textToDoc(str(f, "content")),
  } as z.input<typeof lessonBodySchema>;
}

export async function createCourseForm(f: FormData) {
  await finish(await createCourse(courseFromForm(f)), "/admin/courses/new", (c) => `/admin/courses/${c.id}?done=สร้างหลักสูตรแล้ว`);
}

export async function updateCourseForm(id: string, f: FormData) {
  await finish(await updateCourse({ id, ...courseFromForm(f) }), `/admin/courses/${id}`, "บันทึกแล้ว");
}

export async function setPublishedForm(id: string, published: boolean) {
  await finish(await setCoursePublished({ id, published }), `/admin/courses/${id}`, published ? "เผยแพร่แล้ว" : "ยกเลิกเผยแพร่แล้ว");
}

export async function deleteCourseForm(id: string, f: FormData) {
  await finish(await deleteCourse({ id, confirmTitle: str(f, "confirmTitle") }), `/admin/courses/${id}`, () => "/admin?done=ลบหลักสูตรแล้ว");
}

export async function createLessonForm(courseId: string, f: FormData) {
  await finish(await createLesson({ courseId, lesson: lessonFromForm(f) }), `/admin/courses/${courseId}`, "เพิ่มบทเรียนแล้ว");
}

export async function updateLessonForm(id: string, f: FormData) {
  await finish(await updateLesson({ id, lesson: lessonFromForm(f) }), `/admin/lessons/${id}`, "บันทึกแล้ว");
}

export async function deleteLessonForm(id: string, courseId: string) {
  await finish(await deleteLesson({ id }), `/admin/courses/${courseId}`, "ลบบทเรียนแล้ว");
}

export async function reorderLessonsForm(courseId: string, lessonIds: string[]) {
  await finish(await reorderLessons({ courseId, lessonIds }), `/admin/courses/${courseId}`);
}

/** ฟอร์มแบบทดสอบ: q{i} = คำถาม, q{i}e = คำอธิบาย, q{i}o{j} = ตัวเลือก, q{i}c = index ข้อที่ถูก (คำถาม/ตัวเลือกที่ว่างจะถูกข้าม) */
export async function saveQuizForm(lessonId: string, f: FormData) {
  const questions = [];
  for (let i = 0; i < Number(str(f, "questionCount")); i++) {
    const text = str(f, `q${i}`);
    if (!text) continue;
    const options = [];
    for (let j = 0; j < Number(str(f, `q${i}optionCount`)); j++) {
      const opt = str(f, `q${i}o${j}`);
      if (opt) options.push({ text: opt, isCorrect: str(f, `q${i}c`) === String(j) });
    }
    questions.push({ text, explanation: str(f, `q${i}e`), options });
  }
  await finish(
    await saveQuiz({ lessonId, passingScore: Number(str(f, "passingScore")), questions }),
    `/admin/lessons/${lessonId}`,
    "บันทึกแบบทดสอบแล้ว",
  );
}

export async function setUserRoleForm(id: string, role: "ADMIN" | "LEARNER") {
  await finish(await setUserRole({ id, role }), "/admin/users", role === "ADMIN" ? "ตั้งเป็นแอดมินแล้ว" : "เปลี่ยนเป็นผู้เรียนแล้ว");
}

export async function deleteUserForm(id: string) {
  await finish(await deleteUser({ id }), "/admin/users", "ลบบัญชีแล้ว");
}

export async function enrollByEmailForm(courseId: string, f: FormData) {
  await finish(await enrollByEmail({ courseId, email: str(f, "email") }), `/admin/courses/${courseId}`, "เพิ่มผู้เรียนแล้ว");
}

export async function removeEnrollmentForm(courseId: string, userId: string) {
  await finish(await removeEnrollment({ courseId, userId }), `/admin/courses/${courseId}`, "ถอนผู้เรียนออกแล้ว");
}

export async function revokeCertificateForm(id: string) {
  await finish(await revokeCertificate({ id }), "/admin/certificates", "ยกเลิกใบประกาศแล้ว");
}
