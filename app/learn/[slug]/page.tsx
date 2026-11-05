import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { auth } from "@/auth";
import { Icon } from "@/app/components/icons";
import { RichText } from "@/app/components/rich-text";
import { completeLesson, enroll, submitQuiz } from "@/lib/learn/actions";
import { prisma } from "@/lib/prisma";

const lessonTypeLabel = { VIDEO: "วิดีโอ", TEXT: "บทอ่าน", QUIZ: "แบบทดสอบ" } as const;

export const metadata: Metadata = { title: "ห้องเรียน", robots: { index: false } };

async function Classroom({ params, searchParams }: PageProps<"/learn/[slug]">) {
  // auth() ใช้ crypto ตอนถอด session จึงต้อง render ตอน request
  await connection();
  const userId = (await auth())?.user?.id;
  if (!userId) redirect("/login");

  const { slug } = await params;
  const { lesson: lessonParam } = await searchParams;

  // ไม่ select isCorrect: ห้ามส่งเฉลยไปหน้าเว็บ
  const course = await prisma.course.findFirst({
    where: { slug, published: true },
    select: {
      id: true,
      slug: true,
      title: true,
      summary: true,
      enrollments: { where: { userId }, select: { completedAt: true } },
      certificates: { where: { userId }, select: { code: true } },
      lessons: {
        orderBy: { position: "asc" },
        select: {
          id: true,
          title: true,
          type: true,
          position: true,
          youtubeId: true,
          content: true,
          attachmentUrl: true,
          progress: { where: { userId, completedAt: { not: null } }, select: { id: true } },
          quiz: {
            select: {
              passingScore: true,
              questions: {
                orderBy: { position: "asc" },
                select: { id: true, text: true, options: { orderBy: { id: "asc" }, select: { id: true, text: true } } },
              },
              attempts: { where: { userId }, orderBy: { createdAt: "desc" }, take: 1, select: { score: true, passed: true } },
            },
          },
        },
      },
    },
  });
  if (!course) notFound();

  if (!course.enrollments.length) {
    return (
      <div className="wrap">
        <section className="enroll-card" aria-labelledby="enroll-title">
          <Link href={`/courses/${course.slug}`} className="back-link">
            &larr; รายละเอียดหลักสูตร
          </Link>
          <h1 id="enroll-title">{course.title}</h1>
          <p>{course.summary}</p>
          <p>
            {course.lessons.length} บทเรียน · ลงทะเบียนครั้งเดียว ระบบจะบันทึกความคืบหน้าและออกใบประกาศเมื่อเรียนจบ
          </p>
          <form action={enroll.bind(null, course.id)}>
            <button className="button button-primary">
              ลงทะเบียนและเริ่มเรียน
              <Icon name="arrow" size={18} />
            </button>
          </form>
        </section>
      </div>
    );
  }

  const lessons = course.lessons;
  const isDone = (l: (typeof lessons)[number]) => l.progress.length > 0;
  const doneCount = lessons.filter(isDone).length;
  const current =
    lessons.find((l) => l.position === Number(lessonParam)) ?? lessons.find((l) => !isDone(l)) ?? lessons[0];
  if (!current) notFound();
  const next = lessons.find((l) => l.position > current.position);
  const lastAttempt = current.quiz?.attempts[0];
  const certificate = course.certificates[0];
  const nextLink = next && (
    <Link href={`/learn/${course.slug}?lesson=${next.position}`} className="button button-outline">
      บทถัดไป
      <Icon name="arrow" size={18} />
    </Link>
  );

  return (
    <div className="wrap classroom">
      <nav aria-label="บทเรียนในหลักสูตร" className="classroom-nav">
        <Link href={`/courses/${course.slug}`} className="back-link">
          &larr; รายละเอียดหลักสูตร
        </Link>
        <h2>{course.title}</h2>
        <div>
          <p className="progress-label">
            <span>ความคืบหน้า</span>
            <span>
              {doneCount}/{lessons.length} บท
            </span>
          </p>
          <progress className="progress" value={doneCount} max={lessons.length} aria-label="ความคืบหน้าของหลักสูตร" />
        </div>
        <ol className="lesson-nav">
          {lessons.map((l) => (
            <li key={l.id} className={isDone(l) ? "is-done" : undefined}>
              <Link href={`/learn/${course.slug}?lesson=${l.position}`} aria-current={l.id === current.id ? "page" : undefined}>
                <span className="lesson-mark" aria-hidden="true">
                  {isDone(l) ? <Icon name="check" size={14} /> : l.position}
                </span>
                <span>
                  {l.title}
                  {isDone(l) && <span className="sr-only"> (เรียนแล้ว)</span>}
                </span>
              </Link>
            </li>
          ))}
        </ol>
        {certificate && (
          <Link href={`/certificates/${certificate.code}`} className="button button-primary">
            ดูใบประกาศ
          </Link>
        )}
      </nav>

      <article className="classroom-main">
        <header>
          <h1>{current.title}</h1>
          <p className="lesson-meta">
            บทที่ {current.position} จาก {lessons.length} · {lessonTypeLabel[current.type]}
          </p>
        </header>

        {current.type === "VIDEO" && current.youtubeId && (
          <div className="video-frame">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${current.youtubeId}`}
              title={current.title}
              allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}

        <RichText doc={current.content} className="prose" />

        {current.attachmentUrl && (
          <a href={current.attachmentUrl} target="_blank" rel="noreferrer" className="text-link">
            เปิดไฟล์แนบ
          </a>
        )}

        {current.quiz ? (
          <section aria-labelledby="quiz-title" className="quiz">
            <h2 id="quiz-title">
              แบบทดสอบ {current.quiz.questions.length} ข้อ · ผ่านที่ {current.quiz.passingScore}%
            </h2>
            {lastAttempt && (
              <p role="status" className={lastAttempt.passed ? "notice notice-pass" : "notice"}>
                ครั้งล่าสุดได้ {lastAttempt.score}% {lastAttempt.passed ? "ผ่านแล้ว" : "ยังไม่ผ่าน ลองใหม่ได้"}
              </p>
            )}
            <form action={submitQuiz.bind(null, current.id)} className="quiz-form">
              {current.quiz.questions.map((q, i) => (
                <fieldset key={q.id} className="quiz-question">
                  <legend>
                    {i + 1}. {q.text}
                  </legend>
                  {q.options.map((o) => (
                    <label key={o.id} className="quiz-option">
                      <input type="radio" name={q.id} value={o.id} required />
                      {o.text}
                    </label>
                  ))}
                </fieldset>
              ))}
              <div className="lesson-actions">
                <button className="button button-primary">ส่งคำตอบ</button>
                {lastAttempt?.passed && nextLink}
              </div>
            </form>
          </section>
        ) : (
          <div className="lesson-actions">
            {isDone(current) ? (
              <p role="status" className="lesson-done">
                <Icon name="check" size={20} />
                เรียนบทนี้แล้ว
              </p>
            ) : (
              <form action={completeLesson.bind(null, current.id)}>
                <button className="button button-primary">
                  เรียนจบบทนี้
                  <Icon name="check" size={18} />
                </button>
              </form>
            )}
            {nextLink}
          </div>
        )}
      </article>
    </div>
  );
}

export default function LearnPage(props: PageProps<"/learn/[slug]">) {
  return (
    <Suspense fallback={<div className="wrap py-10">กำลังโหลด...</div>}>
      <Classroom {...props} />
    </Suspense>
  );
}
