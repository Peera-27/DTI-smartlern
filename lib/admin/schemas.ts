import { z } from "zod";

const id = z.cuid();

const slug = z
  .string()
  .trim()
  .toLowerCase()
  .min(3, "slug ต้องยาวอย่างน้อย 3 ตัวอักษร")
  .max(80)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "ใช้ได้เฉพาะ a-z, 0-9 และขีดกลาง เช่น intro-python");

/** Tiptap JSON: เช็คแค่โครงชั้นบนสุด และจำกัดขนาดไม่ให้ใหญ่เกิน ~200KB */
const richText = z
  .looseObject({ type: z.literal("doc"), content: z.array(z.unknown()).optional() })
  .refine((v) => JSON.stringify(v).length <= 200_000, "เนื้อหายาวเกินไป");

const httpsUrl = z.url({ protocol: /^https$/, error: "ต้องเป็นลิงก์ https" });

/** รูปปก: ลิงก์ https หรือไฟล์ใน /public เช่น /media/safety.jpg (ห้าม // ซึ่งคือลิงก์ไปเว็บอื่น) */
export const imageSrc = z.union([httpsUrl, z.string().regex(/^\/(?!\/)[\w\-./]+$/, "ต้องเป็นลิงก์ https หรือ path ที่ขึ้นต้นด้วย /")]);

/** รับได้ทั้ง ID 11 ตัว หรือ URL เต็มของ YouTube แล้วเก็บเฉพาะ ID */
export function extractYoutubeId(input: string): string | null {
  const s = input.trim();
  if (/^[\w-]{11}$/.test(s)) return s;
  const m = s.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{11})/);
  return m?.[1] ?? null;
}

const youtubeId = z
  .string()
  .transform((v, ctx) => {
    const yid = extractYoutubeId(v);
    if (!yid) ctx.addIssue({ code: "custom", message: "ลิงก์หรือรหัส YouTube ไม่ถูกต้อง" });
    return yid ?? z.NEVER;
  });

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((v) => v || null)
    .nullish();

// ---------- Course ----------

const courseFields = {
  slug,
  title: z.string().trim().min(1, "กรุณาใส่ชื่อคอร์ส").max(200),
  summary: z.string().trim().min(1, "กรุณาใส่คำอธิบายสั้น").max(300, "ไม่เกิน 300 ตัวอักษร (ใช้เป็น meta description)"),
  description: richText.nullish(),
  coverImage: imageSrc.nullish(),
  instructor: optionalText(120),
  durationMin: z.int().min(1).max(10_000).nullish(),
};

export const createCourseSchema = z.object(courseFields);
export const updateCourseSchema = z.object({ id, ...courseFields }).partial().required({ id: true });
/** confirmTitle: ต้องพิมพ์ชื่อคอร์สให้ตรง ถ้าคอร์สมีผู้เรียนแล้ว (ลบแล้วข้อมูลผู้เรียนหายด้วย) */
export const deleteCourseSchema = z.object({ id, confirmTitle: z.string().trim().optional() });
export const setPublishedSchema = z.object({ id, published: z.boolean() });

// ---------- Lesson ----------

const lessonBase = {
  title: z.string().trim().min(1, "กรุณาใส่ชื่อบทเรียน").max(200),
  attachmentUrl: httpsUrl.nullish(),
};

/** แยก field ที่ต้องมีตามชนิดบทเรียน: TEXT ต้องมีเนื้อหาหรือไฟล์แนบ (PDF) อย่างใดอย่างหนึ่ง */
export const lessonBodySchema = z
  .discriminatedUnion("type", [
    z.object({ ...lessonBase, type: z.literal("VIDEO"), youtubeId, content: richText.nullish() }),
    z.object({ ...lessonBase, type: z.literal("TEXT"), content: richText.nullish() }),
    z.object({ ...lessonBase, type: z.literal("QUIZ") }),
  ])
  .refine((l) => l.type !== "TEXT" || l.content || l.attachmentUrl, "บทอ่านต้องมีเนื้อหาหรือลิงก์ไฟล์ PDF");

export const createLessonSchema = z.object({ courseId: id, lesson: lessonBodySchema });
export const updateLessonSchema = z.object({ id, lesson: lessonBodySchema });
export const lessonIdSchema = z.object({ id });

export const reorderLessonsSchema = z.object({
  courseId: id,
  lessonIds: z
    .array(id)
    .min(1)
    .max(500)
    .refine((ids) => new Set(ids).size === ids.length, "มี id ซ้ำ"),
});

// ---------- Quiz ----------

const questionSchema = z
  .object({
    text: z.string().trim().min(1, "กรุณาใส่คำถาม").max(1000),
    explanation: optionalText(2000),
    options: z
      .array(z.object({ text: z.string().trim().min(1, "ตัวเลือกห้ามว่าง").max(500), isCorrect: z.boolean() }))
      .min(2, "ต้องมีอย่างน้อย 2 ตัวเลือก")
      .max(10),
  })
  // QuizAttempt.answers เก็บแบบ { questionId: optionId } = ตอบได้ข้อเดียว จึงต้องมีคำตอบถูก 1 ข้อพอดี
  .refine((q) => q.options.filter((o) => o.isCorrect).length === 1, "ต้องมีคำตอบที่ถูกต้อง 1 ข้อพอดี");

export const saveQuizSchema = z.object({
  lessonId: id,
  passingScore: z.int().min(0).max(100),
  questions: z.array(questionSchema).min(1, "ต้องมีอย่างน้อย 1 คำถาม").max(200),
});

// ---------- Users / enrollments / certificates ----------

export const setRoleSchema = z.object({ id, role: z.enum(["ADMIN", "LEARNER"]) });
export const userIdSchema = z.object({ id });
export const enrollByEmailSchema = z.object({ courseId: id, email: z.email("อีเมลไม่ถูกต้อง").trim().toLowerCase() });
export const enrollmentSchema = z.object({ courseId: id, userId: id });
export const certificateIdSchema = z.object({ id });
