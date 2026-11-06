import Link from "next/link";
import { HeaderDropdown } from "./header-dropdown";
import { Icon } from "./icons";
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
  const me = await prisma.user.findUnique({ where: { id: session.user.id }, select: { name: true, email: true, image: true, role: true, updatedAt: true } });
  const initials = (me?.name ?? me?.email ?? "?").trim().slice(0, 2).toUpperCase();
  return (
    <HeaderDropdown avatar label={<>
      {me?.image ? (
        // eslint-disable-next-line @next/next/no-img-element -- รูปของผู้ใช้ที่ล็อกอิน (private) ไม่ผ่าน next/image
        <img src={`/api/me/avatar?v=${me.updatedAt.getTime()}`} alt="" referrerPolicy="no-referrer" />
      ) : (
        <span aria-hidden="true">{initials}</span>
      )}
      <span className="header-account-label"><small>บัญชีของฉัน</small><span>{me?.name || "โปรไฟล์"}</span></span>
      <svg className="header-account-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
    </>}>
      <div className="header-account-summary"><strong>{me?.name || "บัญชีของฉัน"}</strong><span>{me?.email}</span><small>{me?.role === "ADMIN" ? "ผู้ดูแลระบบ" : "ผู้เรียน"}</small></div>
      <Link href="/dashboard"><Icon name="book" size={18} /><span>โปรไฟล์และหลักสูตรของฉัน</span><Icon name="arrow" size={16} /></Link>
      <Link href="/dashboard/settings"><Icon name="screen" size={18} /><span>ตั้งค่าบัญชี</span><Icon name="arrow" size={16} /></Link>
      {me?.role === "ADMIN" && <Link href="/admin"><Icon name="shield" size={18} /><span>จัดการระบบ</span><Icon name="arrow" size={16} /></Link>}
    </HeaderDropdown>
  );
}
