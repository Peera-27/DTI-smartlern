"use client";

import Image from "next/image";
import Link from "next/link";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { categories, courses, type Course } from "../data/courses";
import { Icon } from "./icons";
import { CourseDialog } from "./course-dialog";

const PAGE_SIZE = 6;

export function CourseCatalog() {
  return <Suspense fallback={<section id="courses" className="catalog-loading wrap" aria-busy="true"><h2>เลือกหลักสูตร</h2><p>กำลังโหลดหลักสูตร…</p></section>}><CourseCatalogWithSearchParams /></Suspense>;
}

function CourseCatalogWithSearchParams() {
  const params = useSearchParams();
  return <Catalog key={params.toString()} initialQuery={params.get("q") ?? ""} initialCategory={params.get("category") ?? "ทั้งหมด"}/>;
}

function Catalog({ initialQuery, initialCategory }: { initialQuery: string; initialCategory: string }) {
  const [selected, setSelected] = useState(categories.includes(initialCategory) ? initialCategory : "ทั้งหมด");
  const [query, setQuery] = useState(initialQuery);
  const [sort, setSort] = useState("recommended");
  const [page, setPage] = useState(1);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [dialogCourse, setDialogCourse] = useState<Course | null>(null);
  const search = query.trim().toLocaleLowerCase("th");
  const filtered = courses.filter((course) =>
    (selected === "ทั้งหมด" || course.category === selected) &&
    `${course.title} ${course.category} ${course.description}`.toLocaleLowerCase("th").includes(search));
  if (sort === "duration") filtered.sort((a, b) => a.duration - b.duration);
  if (sort === "title") filtered.sort((a, b) => a.title.localeCompare(b.title, "th"));
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const start = (currentPage - 1) * PAGE_SIZE;
  const visibleCourses = filtered.slice(start, start + PAGE_SIZE);
  const hasFilters = selected !== "ทั้งหมด" || query.length > 0;
  const current = visibleCourses.find((course) => course.id === activeId) ?? visibleCourses[0];

  function resetFilters() {
    setSelected("ทั้งหมด");
    setQuery("");
    setPage(1);
  }

  function changePage(nextPage: number) {
    setPage(nextPage);
    document.getElementById("courses-title")?.focus({ preventScroll: true });
    document.getElementById("courses")?.scrollIntoView({ behavior: "auto", block: "start" });
  }

  return (
    <section id="courses" className="catalog" aria-labelledby="courses-title">
      <div className="wrap catalog-container">
        <div className="catalog-heading"><div><h2 id="courses-title" tabIndex={-1}>เลือกหลักสูตร</h2><p>ค้นหาและเลือกเรียนตามทักษะที่คุณสนใจ</p></div><span className="catalog-total">{courses.length} หลักสูตรทั้งหมด</span></div>
        <div className={`catalog-split${current ? "" : " is-empty"}`}>
          {current && <aside id="course-preview" className="course-preview-panel" aria-labelledby="preview-title"><CoursePreview course={current}/></aside>}
          <div className="catalog-browser">
            <div className="catalog-tools">
              <div className="chips chips-small catalog-categories" role="group" aria-label="หมวดหมู่หลักสูตร">{categories.map((category) => <button type="button" key={category} aria-pressed={selected === category} onClick={() => { setSelected(category); setPage(1); }}>{category}<span className="category-count">{category === "ทั้งหมด" ? courses.length : courses.filter((course) => course.category === category).length}</span></button>)}</div>
              <div className="catalog-fields"><label className="catalog-search"><Icon name="search"/><span className="sr-only">ค้นหาหลักสูตร</span><input type="search" value={query} placeholder="ค้นหาชื่อหรือเนื้อหาหลักสูตร…" onChange={(event) => { setQuery(event.target.value); setPage(1); }}/></label><label className="sort-control"><span className="sr-only">เรียงหลักสูตรตาม</span><select aria-label="เรียงหลักสูตรตาม" value={sort} onChange={(event) => { setSort(event.target.value); setPage(1); }}><option value="recommended">แนะนำ</option><option value="duration">ใช้เวลาน้อยก่อน</option><option value="title">ชื่อหลักสูตร ก–ฮ</option></select></label></div>
            </div>
            <div className="catalog-results"><p role="status">{filtered.length > 0 ? `แสดง ${start + 1}–${start + visibleCourses.length} จาก ${filtered.length} หลักสูตร` : "ไม่พบหลักสูตร"}{search && ` สำหรับ “${query.trim()}”`}</p>{hasFilters && <button type="button" className="clear-filters" onClick={resetFilters}>ล้างตัวกรอง</button>}</div>
            <ol className="course-options">{visibleCourses.map((course, index) => {
              const active = course.id === current?.id;
              return <li key={course.id} className={active ? "is-selected" : undefined}>
                <button type="button" className="course-option" aria-pressed={active} aria-haspopup="dialog" aria-controls="course-dialog" onClick={() => { setActiveId(course.id); setDialogCourse(course); }}>
                  <span className="course-index" aria-hidden="true">{String(start + index + 1).padStart(2, "0")}</span>
                  <span className="course-option-text"><span className="course-option-title">{course.title}</span><span className="course-option-meta">{course.category}<span aria-hidden="true"> · </span>{course.lessons} บทเรียน</span></span>
                  <span className="course-option-end"><span>{course.duration} นาที</span><span className="course-details-label">ดูรายละเอียด <Icon name="arrow" size={17}/></span></span>
                </button>
              </li>;
            })}</ol>
        {filtered.length === 0 && <div className="empty-state"><Icon name="search" size={32}/><h3>ยังไม่พบหลักสูตรที่ตรงกัน</h3><p>ลองใช้คำค้นอื่น หรือเลือกหมวดหมู่ทั้งหมด</p><button type="button" className="button button-dark" onClick={resetFilters}>ดูหลักสูตรทั้งหมด</button></div>}
        {pageCount > 1 && <nav className="catalog-pagination" aria-label="แบ่งหน้าหลักสูตร"><button type="button" disabled={currentPage === 1} onClick={() => changePage(currentPage - 1)}>← ก่อนหน้า</button><span>หน้า {currentPage} จาก {pageCount}</span><button type="button" disabled={currentPage === pageCount} onClick={() => changePage(currentPage + 1)}>ถัดไป →</button></nav>}
          </div>
        </div>
      </div>
      <CourseDialog course={dialogCourse} onClose={() => setDialogCourse(null)}/>
    </section>
  );
}

function CoursePreview({ course }: { course: Course }) {
  return (
    <div className="selected-course">
      <div className="selected-course-image"><Image src={course.image} alt={course.alt} fill sizes="(min-width: 900px) 520px, 90vw"/></div>
      <div className="selected-course-content">
        <p className="selected-course-category">{course.category}</p><h3 id="preview-title">{course.title}</h3>
        <p className="selected-course-description">{course.description}</p>
        <div className="selected-course-facts"><span><Icon name="clock" size={16}/>{course.duration} นาที</span><span><Icon name="book" size={16}/>{course.lessons} บทเรียน</span></div>
        <p className="selected-course-instructor">สอนโดยฝ่ายฝึกอบรม</p>
        {course.slug ? <Link href={`/courses/${course.slug}`} className="button button-primary">ดูหลักสูตรและเริ่มเรียน</Link> : <p className="course-note">หลักสูตรตัวอย่าง ยังไม่เปิดลงทะเบียนเรียน</p>}
      </div>
    </div>
  );
}
