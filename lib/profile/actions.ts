"use server";

import bcrypt from "bcryptjs";
import { refresh } from "next/cache";
import { z } from "zod";
import { auth, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import { avatarSchema, passwordSchema, profileSchema } from "./schemas";

export type FormState = { ok?: boolean; message?: string; fieldErrors?: Record<string, string[] | undefined> } | null;

async function requireUserId() {
  const id = (await auth())?.user?.id;
  if (!id) throw new Error("กรุณาเข้าสู่ระบบ");
  return id;
}

const fail = (error: z.ZodError): FormState => ({ ok: false, message: "ข้อมูลไม่ถูกต้อง", fieldErrors: z.flattenError(error).fieldErrors });

/** ฟอร์มเดียวบันทึกทั้งข้อมูลและรูป: avatar = "keep" (ไม่เปลี่ยน) | "remove" | data URL ของรูปใหม่ */
export async function updateProfile(_: FormState, form: FormData): Promise<FormState> {
  const id = await requireUserId();
  const { avatar = "keep", ...fields } = Object.fromEntries(form);
  const parsed = profileSchema.safeParse(fields);
  if (!parsed.success) return fail(parsed.error);
  const image = avatar === "keep" ? undefined : avatarSchema.safeParse(avatar === "remove" ? null : avatar);
  if (image && !image.success) return { ok: false, message: image.error.issues[0]?.message ?? "ไฟล์รูปไม่ถูกต้อง" };
  await prisma.user.update({ where: { id }, data: { ...parsed.data, ...(image && { image: image.data }) } });
  refresh();
  return { ok: true, message: "บันทึกข้อมูลแล้ว" };
}

export async function changePassword(_: FormState, form: FormData): Promise<FormState> {
  const id = await requireUserId();
  const parsed = passwordSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return fail(parsed.error);
  // ไม่ถามรหัสเดิม เพื่อให้คนที่จำรหัสไม่ได้แต่ยังล็อกอินอยู่ตั้งรหัสใหม่ได้
  // ข้อแลก: ใครเข้าถึงเครื่องที่ล็อกอินค้างไว้ก็เปลี่ยนรหัสได้
  const user = await prisma.user.findUnique({ where: { id }, select: { passwordHash: true } });
  await prisma.user.update({ where: { id }, data: { passwordHash: await bcrypt.hash(parsed.data.password, 12) } });
  refresh();
  return { ok: true, message: user?.passwordHash ? "เปลี่ยนรหัสผ่านแล้ว" : "ตั้งรหัสผ่านแล้ว ใช้อีเมลกับรหัสผ่านนี้เข้าสู่ระบบได้" };
}

/** ลบบัญชีตัวเอง: cascade ลบการลงทะเบียน ความคืบหน้า ผลสอบ และใบประกาศทั้งหมด */
export async function deleteAccount(_: FormState, form: FormData): Promise<FormState> {
  const id = await requireUserId();
  const user = await prisma.user.findUnique({ where: { id }, select: { email: true, role: true } });
  if (!user) return { ok: false, message: "ไม่พบบัญชี" };
  // กันกรณีแอดมินคนสุดท้ายลบตัวเองจนไม่มีใครเข้า /admin ได้
  if (user.role === "ADMIN") return { ok: false, message: "ผู้ดูแลระบบลบบัญชีตัวเองไม่ได้ ให้ผู้ดูแลคนอื่นลดสิทธิ์ก่อน" };
  if (String(form.get("confirmEmail") ?? "").trim().toLowerCase() !== user.email) {
    return { ok: false, message: "พิมพ์อีเมลไม่ตรงกับบัญชีนี้", fieldErrors: { confirmEmail: ["พิมพ์อีเมลไม่ตรงกับบัญชีนี้"] } };
  }
  await prisma.user.delete({ where: { id } });
  await signOut({ redirectTo: "/" });
  return null;
}
