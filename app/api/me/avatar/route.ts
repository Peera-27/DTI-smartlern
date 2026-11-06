import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

/**
 * รูปโปรไฟล์ของผู้ใช้ที่ล็อกอินอยู่ สำหรับ header
 * แยกเป็น URL ให้เบราว์เซอร์ cache ได้ แทนการฝัง data URL หลายสิบ KB ลงใน HTML ทุกหน้า
 * ผู้เรียก (AccountLink) ใส่ ?v=updatedAt ให้ URL เปลี่ยนเมื่อแก้โปรไฟล์ cache จึงยาวได้
 */
export async function GET() {
  const id = (await auth())?.user?.id;
  if (!id) return new Response(null, { status: 401 });
  const image = (await prisma.user.findUnique({ where: { id }, select: { image: true } }))?.image;
  if (!image) return new Response(null, { status: 404 });

  const cache = { "Cache-Control": "private, max-age=31536000, immutable" };
  const data = image.match(/^data:(image\/jpeg);base64,(.+)$/);
  if (data) return new Response(Buffer.from(data[2], "base64"), { headers: { "Content-Type": data[1], ...cache } });
  // รูปจาก Google เป็น URL ภายนอก
  if (image.startsWith("https://")) return new Response(null, { status: 302, headers: { Location: image, ...cache } });
  return new Response(null, { status: 404 });
}
