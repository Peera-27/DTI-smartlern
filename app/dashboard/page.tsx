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

  return (
    <>
      <section aria-labelledby="dashboard-title">
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
        <h2 id="account-title">บัญชีของฉัน</h2>
        <dl>
          <dt>ชื่อ</dt>
          <dd>{session?.user?.name ?? "-"}</dd>
          <dt>อีเมล</dt>
          <dd>{session?.user?.email ?? "-"}</dd>
          <dt>บทบาท</dt>
          <dd>{session?.user?.role ? roleLabel[session.user.role] : "-"}</dd>
        </dl>
        {session?.user?.role === "ADMIN" && (
          <Link href="/admin" className="button button-primary">
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
