import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Icon } from "@/app/components/icons";
import { Reveal } from "@/app/components/motion";
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
    <article>
      <header className="course-hero">
        <div className="wrap grid course-hero-inner">
          <div className="course-hero-text">
            <Reveal as="h1">{course.title}</Reveal>
            <Reveal as="p" className="course-lead" d={1}>
              {course.summary}
            </Reveal>
            <Reveal as="ul" className="facts" d={2}>
              {course.durationMin && (
                <li>
                  <Icon name="clock" size={18} />
                  {formatMinutes(course.durationMin)}
                </li>
              )}
              <li>
                <Icon name="book" size={18} />
                {course.lessons.length} บทเรียน
              </li>
              {course.instructor && <li>สอนโดย{course.instructor}</li>}
            </Reveal>
            <Reveal d={3}>
              <Link href={`/learn/${course.slug}`} className="button button-primary">
                เริ่มเรียน
                <Icon name="arrow" size={18} />
              </Link>
            </Reveal>
          </div>
          {course.coverImage && (
            <Reveal className="course-hero-image" d={2}>
              {/* ลิงก์ภายนอกไม่ผ่าน optimizer เพราะไม่ได้ตั้ง images.remotePatterns ไว้ (ถ้าผ่านจะ error) */}
              <Image src={course.coverImage} alt="" fill priority unoptimized={course.coverImage.startsWith("https://")} sizes="(min-width: 900px) 50vw, 100vw" />
            </Reveal>
          )}
        </div>
      </header>

      <div className="wrap grid course-body">
        {!!course.description && (
          <section aria-labelledby="about-title" className="course-about">
            <Reveal as="h2" id="about-title">เกี่ยวกับหลักสูตร</Reveal>
            <Reveal d={1}>
              <RichText doc={course.description} className="prose" />
            </Reveal>
          </section>
        )}
        <section aria-labelledby="lessons-title" className="course-lessons">
          <Reveal as="h2" id="lessons-title">บทเรียนในหลักสูตร</Reveal>
          <ol className="lesson-list">
            {course.lessons.map((l, i) => (
              <Reveal as="li" key={l.id} d={i + 1}>
                <span className="lesson-num" aria-hidden="true">{l.position}</span>
                <span>{l.title}</span>
                <span className="lesson-type">{lessonTypeLabel[l.type]}</span>
              </Reveal>
            ))}
          </ol>
        </section>
      </div>
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
