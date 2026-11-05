import { Prisma } from "@prisma/client";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export type ActionResult<T = null> =
  | { ok: true; data: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

/** error ที่ตั้งใจส่งข้อความกลับให้ผู้ใช้ (ไม่ใช่บั๊ก) */
export class ActionError extends Error {}

/**
 * เช็คว่าผู้เรียกเป็น ADMIN โดยอ่าน role จาก DB ทุกครั้ง
 * ไม่เชื่อ role ใน JWT เพราะถ้าถอดสิทธิ์ใน DB แล้ว token เดิมยังบอกว่าเป็น ADMIN อยู่จนหมดอายุ
 */
export async function requireAdmin() {
  const session = await auth();
  const id = session?.user?.id;
  if (!id) throw new ActionError("กรุณาเข้าสู่ระบบ");

  const user = await prisma.user.findUnique({ where: { id }, select: { id: true, role: true } });
  if (user?.role !== "ADMIN") throw new ActionError("ไม่มีสิทธิ์ทำรายการนี้");
  return user;
}

/**
 * ห่อ server action ของแอดมิน: เช็คสิทธิ์ -> validate ด้วย Zod -> รัน -> แปลง error เป็น ActionResult
 * ใช้ในไฟล์ "use server" แบบ: export const createCourse = adminAction(schema, async (input) => {...})
 */
export function adminAction<S extends z.ZodType, R>(
  schema: S,
  fn: (input: z.output<S>, admin: { id: string }) => Promise<R>,
) {
  return async (raw: z.input<S>): Promise<ActionResult<R>> => {
    try {
      const admin = await requireAdmin();
      const parsed = schema.safeParse(raw);
      if (!parsed.success) {
        return {
          ok: false,
          error: "ข้อมูลไม่ถูกต้อง",
          fieldErrors: z.flattenError(parsed.error).fieldErrors as Record<string, string[]>,
        };
      }
      return { ok: true, data: await fn(parsed.data, admin) };
    } catch (e) {
      if (e instanceof ActionError) return { ok: false, error: e.message };
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === "P2002") return { ok: false, error: "ข้อมูลซ้ำกับที่มีอยู่แล้ว (เช่น slug)" };
        if (e.code === "P2025") return { ok: false, error: "ไม่พบข้อมูล อาจถูกลบไปแล้ว" };
      }
      console.error(e);
      return { ok: false, error: "เกิดข้อผิดพลาด กรุณาลองใหม่" };
    }
  };
}
