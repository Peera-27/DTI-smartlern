import Link from "next/link";
import type { ReactNode } from "react";
import { connection } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

/**
 * ล็อกอินแล้วแสดงลิงก์โปรไฟล์ ยังไม่ล็อกอินแสดง guest ต้องครอบด้วย <Suspense fallback={guest}>
 * avatar = แสดงรูปโปรไฟล์ (หรืออักษรย่อชื่อ) แทนคำว่า "โปรไฟล์" ใช้ใน header
 */
export async function AccountLink({ className, guest, avatar }: { className?: string; guest: ReactNode; avatar?: boolean }) {
  // auth() อ่าน cookie จึงต้อง render ตอน request
  await connection();
  const session = await auth();
  if (!session?.user) return guest;
  if (!avatar) {
    return (
      <Link href="/dashboard" className={className}>
        โปรไฟล์
      </Link>
    );
  }

  // อ่านจาก DB ไม่ใช่ session เพราะชื่อ/รูปใน JWT ไม่อัปเดตหลังแก้โปรไฟล์
  const me = await prisma.user.findUnique({ where: { id: session.user.id }, select: { name: true, email: true, image: true, updatedAt: true } });
  const initials = (me?.name ?? me?.email ?? "?").trim().slice(0, 2).toUpperCase();
  return (
    <Link href="/dashboard" className="header-avatar" aria-label={`โปรไฟล์ของ ${me?.name ?? "ฉัน"}`} title="โปรไฟล์">
      {me?.image ? (
        // eslint-disable-next-line @next/next/no-img-element -- รูปของผู้ใช้ที่ล็อกอิน (private) ไม่ผ่าน next/image
        <img src={`/api/me/avatar?v=${me.updatedAt.getTime()}`} alt="" referrerPolicy="no-referrer" />
      ) : (
        <span aria-hidden="true">{initials}</span>
      )}
      <span className="header-avatar-label">โปรไฟล์</span>
    </Link>
  );
}
