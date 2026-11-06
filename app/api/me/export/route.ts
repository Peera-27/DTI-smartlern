import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

/** ดาวน์โหลดข้อมูลส่วนตัวทั้งหมดของผู้ใช้เป็น JSON (สิทธิ์ขอรับข้อมูลตาม PDPA) */
export async function GET() {
  const id = (await auth())?.user?.id;
  if (!id) return new Response("กรุณาเข้าสู่ระบบ", { status: 401 });

  const data = await prisma.user.findUnique({
    where: { id },
    select: {
      name: true, email: true, image: true, phone: true, organization: true, position: true, role: true, createdAt: true,
      accounts: { select: { provider: true } },
      enrollments: { select: { enrolledAt: true, completedAt: true, course: { select: { title: true } } } },
      progress: { select: { completedAt: true, lesson: { select: { title: true } } } },
      attempts: { select: { score: true, passed: true, createdAt: true, quiz: { select: { lesson: { select: { title: true } } } } } },
      certificates: { select: { code: true, issuedAt: true, course: { select: { title: true } } } },
    },
  });

  return new Response(JSON.stringify(data, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": 'attachment; filename="smartlern-my-data.json"',
      "Cache-Control": "no-store",
    },
  });
}
