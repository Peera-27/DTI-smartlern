"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, type MouseEvent } from "react";
import type { Course } from "../data/courses";
import { Icon } from "./icons";

export function CourseDialog({ course, onClose }: { course: Course | null; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (!course) {
      if (dialog.open) dialog.close();
      return;
    }
    if (!dialog.open) dialog.showModal();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previousOverflow; };
  }, [course]);

  function handleBackdropClick(event: MouseEvent<HTMLDialogElement>) {
    if (event.target !== event.currentTarget) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) {
      event.currentTarget.close();
    }
  }

  return (
    <dialog id="course-dialog" ref={dialogRef} className="course-dialog" aria-labelledby="course-dialog-title" onClose={onClose} onClick={handleBackdropClick}>
      <div className="course-dialog-header"><span>รายละเอียดหลักสูตร</span><button type="button" className="course-dialog-close" aria-label="ปิดรายละเอียดหลักสูตร" onClick={() => dialogRef.current?.close()}><span aria-hidden="true">×</span></button></div>
      {course && <>
        <div className="course-dialog-image"><Image src={course.image} alt={course.alt} fill sizes="(min-width: 800px) 720px, 95vw"/></div>
        <div className="course-dialog-content">
          <p className="selected-course-category">{course.category}</p>
          <h2 id="course-dialog-title">{course.title}</h2>
          <div className="course-dialog-facts"><span><Icon name="clock" size={17}/>{course.duration} นาที</span><span><Icon name="book" size={17}/>{course.lessons} บทเรียน</span><span>ฝ่ายฝึกอบรม</span></div>
          <h3>เกี่ยวกับหลักสูตร</h3>
          <p className="course-dialog-description">{course.description}</p>
          {!course.slug && <p className="course-note">หลักสูตรตัวอย่าง ยังไม่เปิดลงทะเบียนเรียน</p>}
          <div className="course-dialog-footer">{course.slug && <Link href={`/courses/${course.slug}`} className="button button-primary">ดูหลักสูตรและเริ่มเรียน</Link>}<button type="button" className="button button-primary" onClick={() => dialogRef.current?.close()}>กลับไปเลือกหลักสูตร</button></div>
        </div>
      </>}
    </dialog>
  );
}
