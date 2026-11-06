"use client";

import Link from "next/link";
import Image from "next/image";
import { useActionState, useRef, useState } from "react";
import { docToText } from "@/lib/admin/text";
import { saveCourseForm } from "./actions";

type Values = { id: string; title: string; slug: string; summary: string; description: unknown; coverImage: string | null; instructor: string | null; durationMin: number | null };

export function CourseForm({ course }: { course?: Values }) {
  const coverInput = useRef<HTMLInputElement>(null);
  const [values, setValues] = useState({ title: course?.title ?? "", slug: course?.slug ?? "", summary: course?.summary ?? "", description: docToText(course?.description), coverImage: course?.coverImage ?? "", instructor: course?.instructor ?? "", durationMin: course?.durationMin?.toString() ?? "" });
  const [state, action, pending] = useActionState(saveCourseForm.bind(null, course?.id ?? null), { error: "", fieldErrors: undefined });
  const [uploadError, setUploadError] = useState("");
  const [readingImage, setReadingImage] = useState(false);

  async function chooseCover(file?: File) {
    if (!file) return;
    setUploadError("");
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 5 * 1024 * 1024) {
      setUploadError("เลือกรูป JPG, PNG หรือ WebP ขนาดไม่เกิน 5 MB");
      return;
    }
    setReadingImage(true);
    let bitmap: ImageBitmap | undefined;
    try {
      bitmap = await createImageBitmap(file);
      const canvas = document.createElement("canvas");
      canvas.width = 1200;
      canvas.height = 675;
      const context = canvas.getContext("2d");
      if (!context) throw new Error();
      context.fillStyle = "white";
      context.fillRect(0, 0, canvas.width, canvas.height);
      const scale = Math.max(canvas.width / bitmap.width, canvas.height / bitmap.height);
      const width = bitmap.width * scale;
      const height = bitmap.height * scale;
      context.drawImage(bitmap, (canvas.width - width) / 2, (canvas.height - height) / 2, width, height);
      let image = canvas.toDataURL("image/jpeg", .8);
      if (image.length > 600_000) image = canvas.toDataURL("image/jpeg", .5);
      if (image.length > 600_000) throw new Error();
      setValues((previous) => ({ ...previous, coverImage: image }));
    } catch {
      setUploadError("อ่านรูปไม่ได้หรือรูปยังใหญ่เกินไป กรุณาเลือกรูปที่เล็กลง");
    } finally {
      bitmap?.close();
      setReadingImage(false);
    }
  }
  const fields = [
    { name: "title", label: "ชื่อหลักสูตร", required: true, max: 200 },
    { name: "slug", label: "ชื่อใน URL", required: true, max: 80, help: "ใช้ a-z, 0-9 และขีดกลาง เช่น workplace-safety" },
    { name: "summary", label: "คำอธิบายสั้น", required: true, max: 300 },
    { name: "description", label: "รายละเอียด", help: "เว้นบรรทัดว่างเพื่อขึ้นย่อหน้าใหม่" },
    { name: "instructor", label: "ผู้สอน", max: 120 },
    { name: "durationMin", label: "ระยะเวลา (นาที)" },
  ] as const;
  return <form action={action} className="admin-form" aria-busy={pending}>
    {state.error && <p className="admin-flash admin-flash-error" role="alert">{state.error}</p>}
    <fieldset disabled={pending} className="course-form-fields">
      <div className="field">
        <label htmlFor="course-cover-button">รูปปกหลักสูตร</label>
        <input ref={coverInput} id="course-cover-file" type="file" hidden accept="image/jpeg,image/png,image/webp" disabled={readingImage} onChange={(event) => { void chooseCover(event.target.files?.[0]); event.target.value = ""; }} />
        <button id="course-cover-button" type="button" className="button button-outline" style={{ justifySelf: "start" }} disabled={readingImage} aria-describedby="course-cover-help" onClick={() => coverInput.current?.click()}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 16V3m-5 5 5-5 5 5M4 16v5h16v-5" /></svg>
          {readingImage ? "กำลังเตรียมรูป…" : values.coverImage ? "เปลี่ยนรูปปก" : "เลือกรูปปกจากเครื่อง"}
        </button>
        <input type="hidden" name="coverImage" value={values.coverImage} />
        <small id="course-cover-help">JPG, PNG หรือ WebP ไม่เกิน 5 MB · ระบบครอปกึ่งกลางเป็น 1200 × 675 พิกเซล (16:9) เมื่อกดบันทึกหลักสูตร</small>
        {readingImage && <p role="status">กำลังเตรียมรูป…</p>}
        {(uploadError || state.fieldErrors?.coverImage) && <p role="alert">{uploadError || state.fieldErrors?.coverImage?.join(" · ")}</p>}
        {values.coverImage && <div className="course-cover-preview"><Image src={values.coverImage} alt="ตัวอย่างรูปปกหลักสูตร" width={1200} height={675} unoptimized /><button type="button" className="button button-outline" disabled={readingImage} onClick={() => { setValues((previous) => ({ ...previous, coverImage: "" })); setUploadError(""); }}>นำรูปปกออก</button></div>}
      </div>
      {fields.map((field) => {
        const name = field.name;
        const errors = state.fieldErrors?.[name];
        const props = { id: `course-${name}`, name, value: values[name], onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setValues((previous) => ({ ...previous, [name]: event.target.value })), "aria-invalid": errors?.length ? true as const : undefined, "aria-describedby": `course-${name}-help` };
        return <div className="field" key={name}><label htmlFor={props.id}>{field.label}{"required" in field && field.required ? " *" : ""}</label>
          {name === "description" ? <textarea {...props} rows={6} /> : <input {...props} required={"required" in field && field.required} maxLength={"max" in field ? field.max : undefined} type={name === "durationMin" ? "number" : "text"} min={name === "durationMin" ? 1 : undefined} max={name === "durationMin" ? 10000 : undefined} minLength={name === "slug" ? 3 : undefined} pattern={name === "slug" ? "[a-z0-9]+(-[a-z0-9]+)*" : undefined} />}
          <small id={`course-${name}-help`}>{errors?.join(" · ") || ("help" in field ? field.help : "")}</small>
        </div>;
      })}
    </fieldset>
    <div className="form-actions"><Link href="/admin" className="button button-outline">กลับรายการ</Link><button disabled={pending || readingImage} className="button button-primary">{pending ? "กำลังบันทึก…" : course ? "บันทึกการแก้ไข" : "สร้างหลักสูตร"}</button></div>
  </form>;
}
