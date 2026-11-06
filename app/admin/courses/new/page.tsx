import { CourseForm } from "../../course-form";
import type { Metadata } from "next";
import { Suspense } from "react";
import { Flash, PageHead, requireAdminPage } from "../../shared";

export const metadata: Metadata = { title: "สร้างหลักสูตร", robots: { index: false } };

async function NewCourse({ searchParams }: PageProps<"/admin/courses/new">) {
  await requireAdminPage();
  const { error } = await searchParams;
  return (
    <>
      <PageHead
        back={{ href: "/admin", label: "หลักสูตร" }}
        title="สร้างหลักสูตร"
        sub="เริ่มเป็นฉบับร่าง เพิ่มบทเรียนให้ครบแล้วค่อยกดเผยแพร่"
      />
      <Flash error={error} />
      <section className="panel panel-narrow" aria-label="ข้อมูลหลักสูตรใหม่">
        <CourseForm />
      </section>
    </>
  );
}

export default function NewCoursePage(props: PageProps<"/admin/courses/new">) {
  return (
    <Suspense fallback={<p className="admin-loading">กำลังโหลด…</p>}>
      <NewCourse {...props} />
    </Suspense>
  );
}
