import { z } from "zod";

// ช่องว่างจากฟอร์มเก็บเป็น null
const optional = (max: number) => z.string().trim().max(max, `ยาวไม่เกิน ${max} ตัวอักษร`).transform((v) => v || null);

export const profileSchema = z.object({
  name: z.string().trim().min(1, "กรุณากรอกชื่อ").max(100, "ยาวไม่เกิน 100 ตัวอักษร"),
  phone: optional(20).refine((v) => v === null || /^[0-9+\-\s()]{6,20}$/.test(v), "เบอร์โทรไม่ถูกต้อง"),
  organization: optional(150),
  position: optional(100),
});

export const passwordSchema = z
  .object({
    password: z.string().min(8, "อย่างน้อย 8 ตัวอักษร").max(72, "ยาวไม่เกิน 72 ตัวอักษร"),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, { path: ["confirm"], message: "รหัสผ่านไม่ตรงกัน" });

// รูปโปรไฟล์: JPEG ที่เบราว์เซอร์ย่อเป็น 256x256 แล้ว (ปกติ 15–40 KB) เผื่อไว้ไม่เกิน ~110 KB
export const avatarSchema = z
  .string()
  .max(150_000, "รูปใหญ่เกินไป")
  .regex(/^data:image\/jpeg;base64,[A-Za-z0-9+/]+={0,2}$/, "ไฟล์รูปไม่ถูกต้อง")
  .nullable();
