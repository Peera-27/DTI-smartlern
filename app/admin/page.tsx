import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { deleteCourseForm } from "./actions";
import { ConfirmButton } from "./confirm-button";
import { Flash, PageHead, StatusPill, requireAdminPage } from "./shared";

export const metadata: Metadata = { title: "จัดการหลักสูตร", robots: { index: false } };

async function Courses({ searchParams }: PageProps<"/admin">) {
  await requireAdminPage();
  const { error, done, q, status } = await searchParams;
  const query = typeof q === "string" ? q.trim() : "";
  const filter = status === "published" || status === "draft" ? status : "all";
  const [courses, learners, finished, certificates] = await Promise.all([
    prisma.course.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        slug: true,
        title: true,
        published: true,
        _count: { select: { lessons: true, enrollments: true, certificates: true } },
      },
    }),
    prisma.enrollment.count(),
    prisma.enrollment.count({ where: { completedAt: { not: null } } }),
    prisma.certificate.count(),
  ]);
  const published = courses.filter((c) => c.published).length;
  const visible = courses.filter((course) => (!query || `${course.title} ${course.slug}`.toLocaleLowerCase("th").includes(query.toLocaleLowerCase("th"))) && (filter === "all" || course.published === (filter === "published")));

  return (
    <>
      <PageHead
        title="หลักสูตร"
        sub={`เผยแพร่ ${published} จาก ${courses.length} หลักสูตร`}
        actions={
          <Link href="/admin/courses/new" className="button button-primary">
            สร้างหลักสูตร
          </Link>
        }
      />
      <Flash error={error} done={done} />

      <dl className="kpis">
        <div>
          <dt>หลักสูตรที่เผยแพร่</dt>
          <dd className="num">
            {published}
            <span> / {courses.length}</span>
          </dd>
        </div>
        <div>
          <dt>การลงทะเบียน</dt>
          <dd className="num">{learners.toLocaleString("th-TH")}</dd>
        </div>
        <div>
          <dt>เรียนจบแล้ว</dt>
          <dd className="num">
            {finished.toLocaleString("th-TH")}
            <span> / {learners.toLocaleString("th-TH")}</span>
          </dd>
        </div>
        <div>
          <dt>ใบประกาศที่ออก</dt>
          <dd className="num">{certificates.toLocaleString("th-TH")}</dd>
        </div>
      </dl>

      <section className="panel" aria-labelledby="course-table-title">
        <form className="admin-course-filters" role="search" action="/admin">
          <div className="field"><label htmlFor="course-search">ค้นหาหลักสูตร</label><input id="course-search" name="q" type="search" defaultValue={query} placeholder="ชื่อหลักสูตรหรือชื่อใน URL" /></div>
          <div className="field"><label htmlFor="course-status">สถานะ</label><select id="course-status" name="status" defaultValue={filter}><option value="all">ทั้งหมด</option><option value="published">เผยแพร่</option><option value="draft">ฉบับร่าง</option></select></div>
          <button className="button button-primary">ค้นหา</button>
          {(query || filter !== "all") && <Link href="/admin" className="row-action">ล้างตัวกรอง</Link>}
          <p role="status">พบ {visible.length} จาก {courses.length} หลักสูตร</p>
        </form>
        <h2 id="course-table-title" className="sr-only">
          รายการหลักสูตร
        </h2>
        {visible.length ? (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th scope="col">หลักสูตร</th>
                  <th scope="col">สถานะ</th>
                  <th scope="col" className="num">
                    บทเรียน
                  </th>
                  <th scope="col" className="num">
                    ผู้เรียน
                  </th>
                  <th scope="col" className="num">
                    ใบประกาศ
                  </th>
                  <th scope="col">
                    <span className="sr-only">จัดการ</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {visible.map((c) => (
                  <tr key={c.id}>
                    <td className="cell-main">
                      <Link href={`/admin/courses/${c.id}`}>{c.title}</Link>
                      <small>/courses/{c.slug}</small>
                    </td>
                    <td>
                      <StatusPill live={c.published}>{c.published ? "เผยแพร่" : "ฉบับร่าง"}</StatusPill>
                    </td>
                    <td className="num" data-label="บทเรียน">{c._count.lessons}</td>
                    <td className="num" data-label="ผู้เรียน">{c._count.enrollments}</td>
                    <td className="num" data-label="ใบประกาศ">{c._count.certificates}</td>
                    <td className="cell-actions">
                      <Link href={`/admin/courses/${c.id}`} className="row-action">
                        แก้ไข
                      </Link>
                      {c._count.enrollments ? (
                        // มีผู้เรียนแล้วต้องพิมพ์ชื่อยืนยันในหน้าคอร์ส
                        <Link href={`/admin/courses/${c.id}#delete-course`} className="row-action row-action-danger">
                          ลบ
                        </Link>
                      ) : (
                        <form action={deleteCourseForm.bind(null, c.id)}>
                          <ConfirmButton className="row-action row-action-danger" message={`ลบหลักสูตร "${c.title}" ถาวร?`}>
                            ลบ
                          </ConfirmButton>
                        </form>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty">
            <p>{courses.length ? "ไม่พบหลักสูตรที่ตรงกับตัวกรอง ลองเปลี่ยนคำค้นหาหรือสถานะ" : "ยังไม่มีหลักสูตร"}</p>
            <Link href="/admin/courses/new" className="button button-primary">
              สร้างหลักสูตรแรก
            </Link>
          </div>
        )}
      </section>
    </>
  );
}

export default function AdminPage(props: PageProps<"/admin">) {
  return (
    <Suspense fallback={<p className="admin-loading">กำลังโหลด…</p>}>
      <Courses {...props} />
    </Suspense>
  );
}
