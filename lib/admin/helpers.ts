import { Prisma } from "@prisma/client";
import { updateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { tags } from "@/lib/courses";
import { ActionError } from "./action";

type Tx = Prisma.TransactionClient;

/** แปลงค่าจาก Zod เป็นค่าที่ Prisma รับสำหรับ field Json (null ต้องใช้ DbNull) */
export function toJson(v: unknown): Prisma.InputJsonValue | typeof Prisma.DbNull | undefined {
  if (v === undefined) return undefined;
  if (v === null) return Prisma.DbNull;
  return v as Prisma.InputJsonValue;
}

/** ล้าง cache หน้า public ของคอร์ส ใส่ได้หลาย slug (เช่น slug เก่ากับ slug ใหม่ตอนเปลี่ยนชื่อ) */
export function invalidateCourse(...slugs: string[]) {
  updateTag(tags.courses);
  for (const s of new Set(slugs)) updateTag(tags.course(s));
}

export async function getCourseSlug(courseId: string) {
  const c = await prisma.course.findUnique({ where: { id: courseId }, select: { slug: true } });
  if (!c) throw new ActionError("ไม่พบคอร์ส");
  return c.slug;
}

/**
 * ตั้ง position ให้บทเรียนเป็น 1..n ตามลำดับ id ที่ส่งมา
 *
 * มี @@unique([courseId, position]) และ Postgres เช็ค unique ทันทีทีละแถว
 * ถ้าอัปเดตตรงๆ (เช่นสลับ 1 กับ 2) จะชนกันกลางทาง จึงทำสองขั้น:
 *   1) ตั้งเป็นค่าติดลบ -(i+1) ซึ่งไม่ชนกับค่าบวกเดิม
 *   2) คูณ -1 ทั้งคอร์สในคำสั่งเดียว ตอนนั้นค่าบวกว่างหมดแล้ว
 */
export async function applyLessonOrder(tx: Tx, courseId: string, orderedIds: string[]) {
  for (const [i, id] of orderedIds.entries()) {
    await tx.lesson.update({ where: { id, courseId }, data: { position: -(i + 1) } });
  }
  await tx.lesson.updateMany({ where: { courseId, position: { lt: 0 } }, data: { position: { multiply: -1 } } });
}

/** เรียงเลขใหม่ให้ต่อเนื่อง 1..n (ใช้หลังลบบทเรียน) */
export async function renumberLessons(tx: Tx, courseId: string) {
  const rows = await tx.lesson.findMany({ where: { courseId }, orderBy: { position: "asc" }, select: { id: true } });
  await applyLessonOrder(tx, courseId, rows.map((r) => r.id));
}

/** คืนรายการปัญหาที่ทำให้ยัง publish ไม่ได้ (array ว่าง = พร้อม) */
export async function findPublishProblems(courseId: string, db: Tx = prisma): Promise<string[]> {
  const lessons = await db.lesson.findMany({
    where: { courseId },
    orderBy: { position: "asc" },
    select: {
      position: true,
      title: true,
      type: true,
      youtubeId: true,
      content: true,
      quiz: { select: { questions: { select: { options: { select: { isCorrect: true } } } } } },
    },
  });

  if (lessons.length === 0) return ["คอร์สต้องมีบทเรียนอย่างน้อย 1 บท"];

  const problems: string[] = [];
  for (const l of lessons) {
    const name = `บทที่ ${l.position} "${l.title}"`;
    if (l.type === "VIDEO" && !l.youtubeId) problems.push(`${name}: ยังไม่มีวิดีโอ YouTube`);
    if (l.type === "TEXT" && !l.content) problems.push(`${name}: ยังไม่มีเนื้อหา`);
    if (l.type === "QUIZ") {
      const qs = l.quiz?.questions ?? [];
      if (qs.length === 0) problems.push(`${name}: แบบทดสอบยังไม่มีคำถาม`);
      else if (qs.some((q) => q.options.length < 2 || q.options.filter((o) => o.isCorrect).length !== 1))
        problems.push(`${name}: มีคำถามที่ตัวเลือกไม่ครบ หรือไม่มีคำตอบที่ถูก 1 ข้อ`);
    }
  }
  return problems;
}

/** ใช้ใน transaction หลังแก้บทเรียน: ถ้าคอร์สเผยแพร่อยู่แล้วเนื้อหากลายเป็นไม่ครบ ให้ throw เพื่อ rollback */
export async function assertStillPublishable(tx: Tx, courseId: string) {
  const course = await tx.course.findUnique({ where: { id: courseId }, select: { published: true } });
  if (!course?.published) return;
  const problems = await findPublishProblems(courseId, tx);
  if (problems.length) {
    throw new ActionError(`คอร์สนี้เผยแพร่อยู่ แก้แล้วจะไม่ครบ (ยกเลิกเผยแพร่ก่อน):\n- ${problems.join("\n- ")}`);
  }
}
