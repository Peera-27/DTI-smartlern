import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { RichText } from "@/app/components/rich-text";
import { formatMinutes } from "@/app/data/courses";
import { getPublishedCourse, getPublishedCourseSlugs } from "@/lib/courses";

const lessonTypeLabel = { VIDEO: "วิดีโอ", TEXT: "บทอ่าน", QUIZ: "แบบทดสอบ" } as const;

// สร้างหน้าคอร์สที่เผยแพร่แล้วตอน build
// cacheComponents บังคับว่าต้องคืนอย่างน้อย 1 ค่า ถ้ายังไม่มีคอร์สจึงใส่ค่าหลอกไว้ (หน้านั้นจะเป็น 404)
// คอร์สที่เผยแพร่หลัง build จะถูกสร้างตอนมีคนเข้าครั้งแรก แล้ว cache ไว้ (ISR)
export async function generateStaticParams() {
  const slugs = await getPublishedCourseSlugs();
  return slugs.length ? slugs.map((slug) => ({ slug })) : [{ slug: "_" }];
}

export async function generateMetadata({ params }: PageProps<"/courses/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const course = await getPublishedCourse(slug);
  if (!course) return { title: "ไม่พบหลักสูตร", robots: { index: false } };

  const images = course.coverImage ? [{ url: course.coverImage, alt: course.title }] : undefined;
  return {
    title: course.title,
    description: course.summary,
    alternates: { canonical: `/courses/${course.slug}` },
    openGraph: {
      type: "website",
      title: course.title,
      description: course.summary,
      url: `/courses/${course.slug}`,
      images,
    },
    twitter: { card: images ? "summary_large_image" : "summary", title: course.title, description: course.summary },
  };
}

async function CourseDetail({ params }: Pick<PageProps<"/courses/[slug]">, "params">) {
  const { slug } = await params;
  const course = await getPublishedCourse(slug);
  if (!course) notFound();

  return (
    <article className="wrap mx-auto max-w-3xl space-y-8 py-10">
      <Link href="/#courses" className="text-sm underline">
        &larr; หลักสูตรทั้งหมด
      </Link>

      <header className="space-y-4">
        <h1 className="text-3xl font-bold">{course.title}</h1>
        <p className="text-lg">{course.summary}</p>
        <ul className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
          {course.instructor && <li>ผู้สอน: {course.instructor}</li>}
          {course.durationMin && <li>เวลาเรียน: {formatMinutes(course.durationMin)}</li>}
          <li>{course.lessons.length} บทเรียน</li>
        </ul>
      </header>

      {course.coverImage && (
        <div className="relative aspect-video overflow-hidden">
          <Image src={course.coverImage} alt="" fill priority sizes="(min-width: 768px) 48rem, 100vw" className="object-cover" />
        </div>
      )}

      <RichText doc={course.description} className="space-y-4" />

      <section aria-labelledby="lessons-title" className="space-y-3">
        <h2 id="lessons-title" className="text-xl font-bold">
          บทเรียนในหลักสูตร
        </h2>
        <ol className="divide-y border-y">
          {course.lessons.map((l) => (
            <li key={l.id} className="flex items-baseline justify-between gap-4 py-3">
              <span>
                {l.position}. {l.title}
              </span>
              <span className="shrink-0 text-sm">{lessonTypeLabel[l.type]}</span>
            </li>
          ))}
        </ol>
      </section>

      <Link href={`/learn/${course.slug}`} className="inline-block rounded border px-4 py-2 font-bold">
        เริ่มเรียน
      </Link>
    </article>
  );
}

export default function CoursePage(props: PageProps<"/courses/[slug]">) {
  // อ่าน params ภายใน Suspense เพื่อให้คอร์สที่ไม่ได้ build ไว้ยังได้ App Shell ทันที (partialPrefetching)
  return (
    <Suspense fallback={<div className="wrap py-10">กำลังโหลด...</div>}>
      <CourseDetail params={props.params} />
    </Suspense>
  );
}
