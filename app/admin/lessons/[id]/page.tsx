import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { saveQuizForm, updateLessonForm } from "../../actions";
import { Flash, LessonFields, PageHead, lessonTypeLabel, requireAdminPage } from "../../shared";

export const metadata: Metadata = { title: "แก้ไขบทเรียน", robots: { index: false } };

const MIN_OPTIONS = 4;

async function EditLesson({ params, searchParams }: PageProps<"/admin/lessons/[id]">) {
  await requireAdminPage();
  const { id } = await params;
  const { error, done } = await searchParams;

  const lesson = await prisma.lesson.findUnique({
    where: { id },
    include: {
      course: { select: { id: true, title: true, _count: { select: { lessons: true } } } },
      quiz: {
        select: {
          passingScore: true,
          questions: {
            orderBy: { position: "asc" },
            select: { text: true, explanation: true, options: { orderBy: { id: "asc" }, select: { text: true, isCorrect: true } } },
          },
        },
      },
    },
  });
  if (!lesson) notFound();

  // คำถามเดิม + ช่องว่างอีก 1 ข้อไว้เพิ่มคำถาม (บันทึกแล้วจะได้ช่องว่างใหม่)
  const saved = lesson.quiz?.questions ?? [];
  const questions = [...saved, { text: "", explanation: null, options: [] }];
  const isQuiz = lesson.type === "QUIZ";

  return (
    <>
      <PageHead
        back={{ href: `/admin/courses/${lesson.course.id}`, label: lesson.course.title }}
        title={lesson.title}
        sub={`บทที่ ${lesson.position} จาก ${lesson.course._count.lessons} · ${lessonTypeLabel[lesson.type]}`}
      />
      <Flash error={error} done={done} />

      <div className={isQuiz ? "admin-split" : undefined}>
        <section aria-labelledby="lesson-form-title" className={isQuiz ? "panel" : "panel panel-narrow"}>
          <div className="panel-head">
            <h2 id="lesson-form-title">ข้อมูลบทเรียน</h2>
          </div>
          <form action={updateLessonForm.bind(null, lesson.id)} className="admin-form">
            <LessonFields l={lesson} />
            <div className="form-actions">
              <button className="button button-primary">บันทึก</button>
            </div>
          </form>
        </section>

        {isQuiz && (
          <section aria-labelledby="quiz-form-title" className="panel">
            <div className="panel-head">
              <h2 id="quiz-form-title">แบบทดสอบ</h2>
              <span className="panel-meta">{saved.length} ข้อ</span>
            </div>
            <form action={saveQuizForm.bind(null, lesson.id)} className="admin-form">
              <div className="field field-short">
                <label htmlFor="passingScore">คะแนนผ่าน (%)</label>
                <input id="passingScore" name="passingScore" type="number" min={0} max={100} required defaultValue={lesson.quiz?.passingScore ?? 70} />
              </div>
              <input type="hidden" name="questionCount" value={questions.length} />
              {questions.map((q, i) => {
                const optionCount = Math.max(MIN_OPTIONS, q.options.length);
                return (
                  <fieldset key={i} className={q.text ? "question" : "question question-new"}>
                    <legend>{q.text ? `ข้อ ${i + 1}` : "เพิ่มคำถามใหม่"}</legend>
                    <div className="field">
                      <label htmlFor={`q${i}`}>คำถาม</label>
                      <input id={`q${i}`} name={`q${i}`} defaultValue={q.text} />
                    </div>
                    <input type="hidden" name={`q${i}optionCount`} value={optionCount} />
                    <div className="options" role="group" aria-label={`ตัวเลือก (เลือกวงกลมหน้าคำตอบที่ถูก)`}>
                      {Array.from({ length: optionCount }, (_, j) => (
                        <div key={j} className="option">
                          <input
                            type="radio"
                            name={`q${i}c`}
                            value={j}
                            defaultChecked={q.options[j]?.isCorrect}
                            aria-label={`ตัวเลือก ${j + 1} เป็นคำตอบที่ถูก`}
                          />
                          <input name={`q${i}o${j}`} defaultValue={q.options[j]?.text} placeholder={`ตัวเลือก ${j + 1}`} aria-label={`ตัวเลือก ${j + 1}`} />
                        </div>
                      ))}
                    </div>
                    <div className="field">
                      <label htmlFor={`q${i}e`}>คำอธิบายเฉลย (ไม่บังคับ)</label>
                      <input id={`q${i}e`} name={`q${i}e`} defaultValue={q.explanation ?? ""} />
                    </div>
                  </fieldset>
                );
              })}
              <div className="form-actions">
                <small>เลือกวงกลมหน้าคำตอบที่ถูก · ล้างช่องคำถามเพื่อลบข้อนั้น</small>
                <button className="button button-primary">บันทึกแบบทดสอบ</button>
              </div>
            </form>
          </section>
        )}
      </div>
    </>
  );
}

export default function EditLessonPage(props: PageProps<"/admin/lessons/[id]">) {
  return (
    <Suspense fallback={<p className="admin-loading">กำลังโหลด…</p>}>
      <EditLesson {...props} />
    </Suspense>
  );
}
