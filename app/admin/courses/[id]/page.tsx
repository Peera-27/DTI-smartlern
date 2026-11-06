import { CourseForm } from "../../course-form";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import {
  createLessonForm,
  deleteCourseForm,
  deleteLessonForm,
  enrollByEmailForm,
  removeEnrollmentForm,
  reorderLessonsForm,
  setPublishedForm,
} from "../../actions";
import { ConfirmButton } from "../../confirm-button";
import { Flash, LessonFields, PageHead, StatusPill, dateFmt, lessonTypeLabel, requireAdminPage } from "../../shared";

export const metadata: Metadata = { title: "แก้ไขหลักสูตร", robots: { index: false } };

/** สลับตำแหน่ง i กับ j แล้วคืนรายการ id ใหม่ทั้งหมด (reorderLessons ต้องการครบทุกบท) */
function swapped(ids: string[], i: number, j: number) {
  const next = [...ids];
  if (j < 0 || j >= ids.length) return next; // ปุ่มนี้ถูก disable อยู่แล้ว
  [next[i], next[j]] = [next[j], next[i]];
  return next;
}

async function EditCourse({ params, searchParams }: PageProps<"/admin/courses/[id]">) {
  await requireAdminPage();
  const { id } = await params;
  const { error, done } = await searchParams;

  const [course, progress] = await Promise.all([
    prisma.course.findUnique({
      where: { id },
      include: {
        lessons: { orderBy: { position: "asc" }, select: { id: true, title: true, type: true, position: true } },
        enrollments: {
          orderBy: { enrolledAt: "desc" },
          select: { userId: true, enrolledAt: true, completedAt: true, user: { select: { name: true, email: true } } },
        },
      },
    }),
    prisma.lessonProgress.groupBy({
      by: ["userId"],
      where: { lesson: { courseId: id }, completedAt: { not: null } },
      _count: { _all: true },
    }),
  ]);
  if (!course) notFound();
  const doneBy = new Map(progress.map((p) => [p.userId, p._count._all]));
  const ids = course.lessons.map((l) => l.id);
  const total = course.lessons.length;

  return (
    <>
      <PageHead
        back={{ href: "/admin", label: "หลักสูตร" }}
        title={course.title}
        sub={
          <>
            <StatusPill live={course.published}>{course.published ? "เผยแพร่" : "ฉบับร่าง"}</StatusPill>
            <span>
              {total} บทเรียน · ผู้เรียน {course.enrollments.length} คน
            </span>
          </>
        }
        actions={
          <>
            {course.published && (
              <Link href={`/courses/${course.slug}`} className="button button-outline">
                ดูหน้าหลักสูตร
              </Link>
            )}
            <form action={setPublishedForm.bind(null, course.id, !course.published)}>
              <button className={`button ${course.published ? "button-outline" : "button-primary"}`}>
                {course.published ? "ยกเลิกเผยแพร่" : "เผยแพร่"}
              </button>
            </form>
          </>
        }
      />
      <Flash error={error} done={done} />

      <div className="admin-split">
        <section aria-labelledby="lessons-title" className="panel">
          <div className="panel-head">
            <h2 id="lessons-title">บทเรียน</h2>
            <span className="panel-meta">{total} บท</span>
          </div>
          {total ? (
            <ol className="lesson-rows">
              {course.lessons.map((l, i) => (
                <li key={l.id}>
                  <span className="lesson-no num" aria-hidden="true">
                    {l.position}
                  </span>
                  <span className="cell-main">
                    <Link href={`/admin/lessons/${l.id}`}>{l.title}</Link>
                    <small>{lessonTypeLabel[l.type]}</small>
                  </span>
                  <span className="lesson-tools">
                    <form action={reorderLessonsForm.bind(null, course.id, swapped(ids, i, i - 1))}>
                      <button className="tool" disabled={i === 0} aria-label={`เลื่อน ${l.title} ขึ้น`}>
                        ↑
                      </button>
                    </form>
                    <form action={reorderLessonsForm.bind(null, course.id, swapped(ids, i, i + 1))}>
                      <button className="tool" disabled={i === total - 1} aria-label={`เลื่อน ${l.title} ลง`}>
                        ↓
                      </button>
                    </form>
                    <form action={deleteLessonForm.bind(null, l.id, course.id)}>
                      <ConfirmButton className="tool tool-danger" aria-label={`ลบ ${l.title}`} message={`ลบบท "${l.title}" ?`}>
                        ×
                      </ConfirmButton>
                    </form>
                  </span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="empty-line">ยังไม่มีบทเรียน เพิ่มบทแรกด้านล่าง</p>
          )}

          <details className="add-lesson" open={!total}>
            <summary>+ เพิ่มบทเรียน</summary>
            <form action={createLessonForm.bind(null, course.id)} className="admin-form">
              <LessonFields />
              <div className="form-actions">
                <small>บทแบบทดสอบ: เพิ่มบทก่อน แล้วกดชื่อบทเพื่อใส่คำถาม</small>
                <button className="button button-primary">เพิ่มบทเรียน</button>
              </div>
            </form>
          </details>
        </section>

        <section aria-labelledby="details-title" className="panel">
          <div className="panel-head">
            <h2 id="details-title">ข้อมูลหลักสูตร</h2>
          </div>
          <CourseForm key={course.updatedAt.toISOString()} course={course} />
        </section>
      </div>

      <section aria-labelledby="learners-title" className="panel">
        <div className="panel-head">
          <h2 id="learners-title">ผู้เรียน</h2>
          <form action={enrollByEmailForm.bind(null, course.id)} className="inline-form">
            <label htmlFor="enroll-email" className="sr-only">
              อีเมลผู้เรียนที่จะเพิ่ม
            </label>
            <input id="enroll-email" name="email" type="email" required placeholder="อีเมลผู้ใช้ที่สมัครแล้ว" />
            <button className="button button-outline">เพิ่มผู้เรียน</button>
          </form>
        </div>
        {course.enrollments.length ? (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th scope="col">ผู้เรียน</th>
                  <th scope="col" className="num">
                    ลงทะเบียน
                  </th>
                  <th scope="col" className="num">
                    ความคืบหน้า
                  </th>
                  <th scope="col">สถานะ</th>
                  <th scope="col">
                    <span className="sr-only">จัดการ</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {course.enrollments.map((e) => {
                  const done = doneBy.get(e.userId) ?? 0;
                  return (
                    <tr key={e.userId}>
                      <td className="cell-main">
                        <span>{e.user.name ?? "-"}</span>
                        <small>{e.user.email}</small>
                      </td>
                      <td className="num" data-label="ลงทะเบียน">{dateFmt.format(e.enrolledAt)}</td>
                      <td className="num" data-label="เรียนแล้ว">
                        {done}
                        <span className="faint"> / {total} บท</span>
                      </td>
                      <td>
                        {e.completedAt ? (
                          <StatusPill live>จบแล้ว {dateFmt.format(e.completedAt)}</StatusPill>
                        ) : (
                          <StatusPill>กำลังเรียน</StatusPill>
                        )}
                      </td>
                      <td className="cell-actions">
                        <form action={removeEnrollmentForm.bind(null, course.id, e.userId)}>
                          <ConfirmButton
                            className="row-action row-action-danger"
                            message={`ถอน ${e.user.email} ออกจากหลักสูตร? ความคืบหน้าและใบประกาศของหลักสูตรนี้จะถูกลบ`}
                          >
                            ถอนออก
                          </ConfirmButton>
                        </form>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="empty-line">ยังไม่มีผู้ลงทะเบียน</p>
        )}
      </section>

      <section aria-labelledby="delete-title" className="danger-zone" id="delete-course">
        <div>
          <h2 id="delete-title">ลบหลักสูตร</h2>
          <p>
            {course.enrollments.length
              ? `ลบถาวร พร้อมความคืบหน้าและใบประกาศของผู้เรียน ${course.enrollments.length} คน พิมพ์ชื่อหลักสูตรเพื่อยืนยัน`
              : "ลบถาวรพร้อมบทเรียนทั้งหมด กู้คืนไม่ได้"}
          </p>
        </div>
        <form action={deleteCourseForm.bind(null, course.id)} className="inline-form">
          {course.enrollments.length > 0 && (
            <>
              <label htmlFor="confirmTitle" className="sr-only">
                พิมพ์ชื่อหลักสูตรเพื่อยืนยัน
              </label>
              <input id="confirmTitle" name="confirmTitle" required placeholder={course.title} autoComplete="off" />
            </>
          )}
          <ConfirmButton className="button button-danger" message={`ลบหลักสูตร "${course.title}" ถาวร?`}>
            ลบหลักสูตร
          </ConfirmButton>
        </form>
      </section>
    </>
  );
}

export default function EditCoursePage(props: PageProps<"/admin/courses/[id]">) {
  return (
    <Suspense fallback={<p className="admin-loading">กำลังโหลด…</p>}>
      <EditCourse {...props} />
    </Suspense>
  );
}
