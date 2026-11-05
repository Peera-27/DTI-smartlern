import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import type { ReactNode } from "react";
import { ActionError, requireAdmin } from "@/lib/admin/action";
import { docToText } from "@/lib/admin/text";

/** เช็คสิทธิ์จาก DB ทุกครั้ง (proxy เช็คแค่ role ใน JWT ซึ่งอาจเก่า) ไม่ใช่แอดมิน = 404 */
export async function requireAdminPage() {
  await connection();
  try {
    return await requireAdmin();
  } catch (e) {
    if (e instanceof ActionError) notFound();
    throw e;
  }
}

export const dateFmt = new Intl.DateTimeFormat("th-TH", { dateStyle: "medium", timeZone: "Asia/Bangkok" });

/** หัวหน้า: ทางกลับ (ถ้ามี) ชื่อหน้า บรรทัดสรุป และปุ่มทางขวา */
export function PageHead({ back, title, sub, actions }: { back?: { href: string; label: string }; title: ReactNode; sub?: ReactNode; actions?: ReactNode }) {
  return (
    <header className="admin-head">
      <div>
        {back && (
          <Link href={back.href} className="admin-back">
            &larr; {back.label}
          </Link>
        )}
        <h1>{title}</h1>
        {sub && <p className="admin-sub">{sub}</p>}
      </div>
      {actions && <div className="admin-head-actions">{actions}</div>}
    </header>
  );
}

/** ข้อความผลลัพธ์จาก ?error= / ?done= ที่ action ใน ./actions ส่งกลับมา */
export function Flash({ error, done }: { error?: string | string[]; done?: string | string[] }) {
  if (typeof error === "string") return <p role="alert" className="admin-flash admin-flash-error">{error}</p>;
  if (typeof done === "string") return <p role="status" className="admin-flash">{done}</p>;
  return null;
}

export function StatusPill({ live, children }: { live?: boolean; children: ReactNode }) {
  return <span className={live ? "pill pill-live" : "pill"}>{children}</span>;
}

type CourseValues = {
  title: string;
  slug: string;
  summary: string;
  description: unknown;
  coverImage: string | null;
  instructor: string | null;
  durationMin: number | null;
};

export function CourseFields({ c }: { c?: CourseValues }) {
  return (
    <>
      <div className="field">
        <label htmlFor="title">ชื่อหลักสูตร</label>
        <input id="title" name="title" defaultValue={c?.title} required maxLength={200} />
      </div>
      <div className="field">
        <label htmlFor="slug">ชื่อใน URL</label>
        <input id="slug" name="slug" defaultValue={c?.slug} required pattern="[a-z0-9]+(-[a-z0-9]+)*" placeholder="workplace-safety" aria-describedby="slug-help" />
        <small id="slug-help">a-z, 0-9 และขีดกลาง หน้าหลักสูตรจะอยู่ที่ /courses/ชื่อนี้</small>
      </div>
      <div className="field">
        <label htmlFor="summary">คำอธิบายสั้น</label>
        <input id="summary" name="summary" defaultValue={c?.summary} required maxLength={300} aria-describedby="summary-help" />
        <small id="summary-help">ไม่เกิน 300 ตัวอักษร แสดงในการ์ดและผลค้นหา</small>
      </div>
      {c && (
        <>
          <div className="field">
            <label htmlFor="description">รายละเอียด</label>
            <textarea id="description" name="description" rows={6} defaultValue={docToText(c.description)} aria-describedby="description-help" />
            <small id="description-help">เว้นบรรทัดว่างเพื่อขึ้นย่อหน้าใหม่</small>
          </div>
          <div className="field">
            <label htmlFor="coverImage">รูปปก</label>
            <input id="coverImage" name="coverImage" defaultValue={c.coverImage ?? ""} placeholder="https://… หรือ /media/safety.jpg" />
          </div>
          <div className="field-row">
            <div className="field">
              <label htmlFor="instructor">ผู้สอน</label>
              <input id="instructor" name="instructor" defaultValue={c.instructor ?? ""} maxLength={120} />
            </div>
            <div className="field">
              <label htmlFor="durationMin">ระยะเวลา (นาที)</label>
              <input id="durationMin" name="durationMin" type="number" min={1} defaultValue={c.durationMin ?? ""} />
            </div>
          </div>
        </>
      )}
    </>
  );
}

export const lessonTypeLabel = { VIDEO: "วิดีโอ", TEXT: "บทอ่าน / PDF", QUIZ: "แบบทดสอบ" } as const;

type LessonValues = { title: string; type: keyof typeof lessonTypeLabel; youtubeId: string | null; attachmentUrl: string | null; content: unknown };

export function LessonFields({ l }: { l?: LessonValues }) {
  return (
    <>
      <div className="field-row">
        <div className="field">
          <label htmlFor="lesson-title">ชื่อบทเรียน</label>
          <input id="lesson-title" name="title" defaultValue={l?.title} required maxLength={200} />
        </div>
        <div className="field">
          <label htmlFor="lesson-type">ชนิด</label>
          <select id="lesson-type" name="type" defaultValue={l?.type ?? "VIDEO"}>
            {Object.entries(lessonTypeLabel).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="field">
        <label htmlFor="lesson-youtube">ลิงก์ YouTube</label>
        <input id="lesson-youtube" name="youtubeId" defaultValue={l?.youtubeId ?? ""} placeholder="https://www.youtube.com/watch?v=…" aria-describedby="youtube-help" />
        <small id="youtube-help">ใช้กับบทวิดีโอ</small>
      </div>
      <div className="field">
        <label htmlFor="lesson-pdf">ลิงก์ไฟล์ PDF</label>
        <input id="lesson-pdf" name="attachmentUrl" type="url" defaultValue={l?.attachmentUrl ?? ""} placeholder="https://drive.google.com/file/d/…" aria-describedby="pdf-help" />
        <small id="pdf-help">ไฟล์ใน Google Drive ต้องแชร์เป็น &ldquo;ทุกคนที่มีลิงก์&rdquo;</small>
      </div>
      <div className="field">
        <label htmlFor="lesson-content">เนื้อหา</label>
        <textarea id="lesson-content" name="content" rows={8} defaultValue={docToText(l?.content)} aria-describedby="content-help" />
        <small id="content-help">บทอ่านต้องมีเนื้อหาหรือ PDF อย่างน้อยหนึ่งอย่าง · เว้นบรรทัดว่างเพื่อขึ้นย่อหน้าใหม่</small>
      </div>
    </>
  );
}
