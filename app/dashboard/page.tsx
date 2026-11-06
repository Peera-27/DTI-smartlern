import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import Link from "next/link";
import { auth, signOut } from "@/auth";
import { Icon } from "@/app/components/icons";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "หลักสูตรของฉัน", robots: { index: false } };

const roleLabel = { ADMIN: "ผู้ดูแลระบบ", LEARNER: "ผู้เรียน" } as const;

async function Dashboard() {
  // auth() ใช้ crypto ตอนถอด session จึงต้องบอก Next ให้ render ตอน request ก่อน
  await connection();
  const session = await auth();
  const userId = session?.user?.id;

  const enrollments = userId
    ? await prisma.enrollment.findMany({
        where: { userId },
        orderBy: { enrolledAt: "desc" },
        select: {
          completedAt: true,
          course: {
            select: {
              slug: true,
              title: true,
              _count: { select: { lessons: true } },
              lessons: { where: { progress: { some: { userId, completedAt: { not: null } } } }, select: { id: true } },
              certificates: { where: { userId }, select: { code: true } },
            },
          },
        },
      })
    : [];
  const finished = enrollments.filter((e) => e.completedAt).length;
  const certs = enrollments.filter((e) => e.course.certificates.length).length;
  // อ่านจาก DB ไม่ใช่ session เพราะชื่อใน JWT ไม่อัปเดตหลังแก้โปรไฟล์
  const me = userId
    ? await prisma.user.findUnique({ where: { id: userId }, select: { name: true, email: true, image: true, organization: true, position: true, phone: true, role: true, createdAt: true } })
    : null;
  const initials = (me?.name ?? me?.email ?? "?").trim().slice(0, 2).toUpperCase();

  return (
    <>
      <section className="dashboard-courses" aria-labelledby="dashboard-title">
        <h1 id="dashboard-title">หลักสูตรของฉัน</h1>
        <p className="dashboard-sub">
          ลงทะเบียน {enrollments.length} หลักสูตร · เรียนจบ {finished} หลักสูตร
        </p>
        {enrollments.length ? (
          <ul className="course-rows">
            {enrollments.map(({ course, completedAt }) => {
              const done = course.lessons.length;
              const total = course._count.lessons;
              const cert = course.certificates[0];
              return (
                <li key={course.slug} className="course-row">
                  <div>
                    <h2>{course.title}</h2>
                    <p className="progress-label">
                      <span>{completedAt ? "เรียนจบแล้ว" : "ความคืบหน้า"}</span>
                      <span>
                        {done}/{total} บท
                      </span>
                    </p>
                    <progress className="progress" value={done} max={total || 1} aria-label={`ความคืบหน้า ${course.title}`} />
                  </div>
                  <div className="course-row-actions">
                    <Link href={`/learn/${course.slug}`} className={`button ${completedAt ? "button-outline" : "button-primary"}`}>
                      {completedAt ? "ทบทวนบทเรียน" : done ? "เรียนต่อ" : "เริ่มเรียน"}
                    </Link>
                    {cert && (
                      <Link href={`/certificates/${cert.code}`} className="text-link">
                        ใบประกาศ
                      </Link>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="empty-block">
            <p>ยังไม่ได้ลงทะเบียนหลักสูตรใด เลือกหลักสูตรแล้วกดเริ่มเรียนได้เลย</p>
            <Link href="/#courses" className="button button-primary">
              เลือกหลักสูตร
              <Icon name="arrow" size={18} />
            </Link>
          </div>
        )}
      </section>

      <aside aria-labelledby="account-title" className="account-panel">
        <p className="profile-eyebrow">บัญชีของฉัน</p>
        <div className="profile-head">
          {me?.image ? (
            // eslint-disable-next-line @next/next/no-img-element -- รูปจาก Google ไม่ได้อยู่ใน images.remotePatterns
            <img src={me.image} alt="" className="profile-avatar" referrerPolicy="no-referrer" />
          ) : (
            <span className="profile-avatar" aria-hidden="true">{initials}</span>
          )}
          <div>
            <h2 id="account-title">{me?.name ?? "ผู้เรียน"}</h2>
            <p>{[me?.position, me?.organization].filter(Boolean).join(" · ") || roleLabel[me?.role ?? "LEARNER"]}</p>
          </div>
        </div>
        <ul className="profile-stats">
          <li><strong>{enrollments.length}</strong>ลงทะเบียน</li>
          <li><strong>{finished}</strong>เรียนจบ</li>
          <li><strong>{certs}</strong>ใบประกาศ</li>
        </ul>
        <dl>
          <dt>อีเมล</dt>
          <dd>{me?.email ?? "-"}</dd>
          <dt>เบอร์โทร</dt>
          <dd>{me?.phone ?? "-"}</dd>
          <dt>บทบาท</dt>
          <dd>{roleLabel[me?.role ?? "LEARNER"]}</dd>
          <dt>สมาชิกตั้งแต่</dt>
          <dd>{me ? me.createdAt.toLocaleDateString("th-TH", { dateStyle: "long", timeZone: "Asia/Bangkok" }) : "-"}</dd>
        </dl>
        <Link href="/dashboard/settings" className="button button-primary">แก้ไขโปรไฟล์และตั้งค่า</Link>
        {me?.role === "ADMIN" && (
          <Link href="/admin" className="button button-outline">
            จัดการหลักสูตร
          </Link>
        )}
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/" });
          }}
        >
          <button className="button button-outline">ออกจากระบบ</button>
        </form>
      </aside>
    </>
  );
}

export default function DashboardPage() {
  return (
    <div className="wrap dashboard">
      <Suspense fallback={<p>กำลังโหลด...</p>}>
        <Dashboard />
      </Suspense>
    </div>
  );
}
