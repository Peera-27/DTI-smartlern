import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { DeleteForm, PasswordForm, ProfileForm } from "./forms";

export const metadata: Metadata = { title: "ตั้งค่าบัญชี", robots: { index: false } };

async function Settings() {
  await connection();
  const id = (await auth())?.user?.id;
  const user = id
    ? await prisma.user.findUnique({
        where: { id },
        select: { name: true, email: true, image: true, phone: true, organization: true, position: true, role: true, passwordHash: true, accounts: { select: { provider: true } } },
      })
    : null;
  if (!user) return <p>ไม่พบบัญชี กรุณาเข้าสู่ระบบใหม่</p>;
  const google = user.accounts.some((a) => a.provider === "google");

  return (
    <>
      <section className="settings-card" aria-labelledby="s-profile">
        <h2 id="s-profile">ข้อมูลส่วนตัว</h2>
        <p className="settings-note">ชื่อนี้จะแสดงบนใบประกาศนียบัตร</p>
        {/* ส่งเฉพาะฟิลด์ที่ฟอร์มใช้ ห้ามส่ง user ทั้งก้อนเพราะมี passwordHash */}
        <ProfileForm initials={(user.name ?? user.email).trim().slice(0, 2).toUpperCase()} user={{ name: user.name, email: user.email, image: user.image, phone: user.phone, organization: user.organization, position: user.position }} />
      </section>

      <section className="settings-card" aria-labelledby="s-password">
        <h2 id="s-password">{user.passwordHash ? "เปลี่ยนรหัสผ่าน" : "ตั้งรหัสผ่าน"}</h2>
        {google && <p className="settings-note">บัญชีนี้เชื่อมกับ Google แล้ว{user.passwordHash ? " เข้าสู่ระบบได้ทั้งสองแบบ" : " ตั้งรหัสผ่านเพื่อเข้าสู่ระบบด้วยอีเมลได้อีกทาง"}</p>}
        <PasswordForm hasPassword={!!user.passwordHash} />
      </section>

      <section className="settings-card" aria-labelledby="s-data">
        <h2 id="s-data">ข้อมูลของฉัน</h2>
        <p className="settings-note">ดาวน์โหลดข้อมูลส่วนตัว ประวัติการเรียน ผลสอบ และใบประกาศทั้งหมดเป็นไฟล์ JSON</p>
        <a href="/api/me/export" className="button button-outline" download>ดาวน์โหลดข้อมูล</a>
      </section>

      <section className="settings-card settings-danger" aria-labelledby="s-delete">
        <h2 id="s-delete">ลบบัญชี</h2>
        {user.role === "ADMIN" ? (
          <p className="settings-note">ผู้ดูแลระบบลบบัญชีตัวเองไม่ได้ ให้ผู้ดูแลคนอื่นลดสิทธิ์ก่อน</p>
        ) : (
          <>
            <p className="settings-note">ลบบัญชี ความคืบหน้า ผลสอบ และใบประกาศทั้งหมดถาวร กู้คืนไม่ได้</p>
            <DeleteForm email={user.email} />
          </>
        )}
      </section>
    </>
  );
}

export default function SettingsPage() {
  return (
    <div className="wrap settings">
      <Link href="/dashboard" className="text-link settings-back">← กลับไปโปรไฟล์</Link>
      <h1>ตั้งค่าบัญชี</h1>
      <Suspense fallback={<p>กำลังโหลด...</p>}>
        <Settings />
      </Suspense>
    </div>
  );
}
