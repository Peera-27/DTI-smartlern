"use client";

import Image from "next/image";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { categories, courses } from "../data/courses";
import { Icon } from "./icons";
import { Reveal } from "./motion";

const times = [30, 45, 60, 0]; // 0 = ไม่จำกัดเวลา

export function CourseCatalog() {
  const params = useSearchParams();
  return <Catalog key={params.toString()} initialQuery={params.get("q") ?? ""} initialCategory={params.get("category") ?? "ทั้งหมด"} />;
}

function Catalog({ initialQuery, initialCategory }: { initialQuery: string; initialCategory: string }) {
  const [selected, setSelected] = useState(categories.includes(initialCategory) ? initialCategory : "ทั้งหมด");
  const [query, setQuery] = useState(initialQuery);
  const [sort, setSort] = useState("recommended");
  const [time, setTime] = useState(0);
  const [active, setActive] = useState<number | null>(null);

  const search = query.trim().toLocaleLowerCase("th");
  const filtered = courses.filter((c) =>
    (selected === "ทั้งหมด" || c.category === selected) &&
    (time === 0 || c.duration <= time) &&
    `${c.title} ${c.category} ${c.description}`.toLocaleLowerCase("th").includes(search));
  if (sort === "duration") filtered.sort((a, b) => a.duration - b.duration);
  const current = filtered.find((c) => c.id === active) ?? filtered[0];
  const minutes = filtered.reduce((sum, c) => sum + c.duration, 0);

  let answer = `${filtered.length} หลักสูตร รวม ${minutes} นาที`;
  if (time) answer = filtered.length ? `มี ${time} นาที เรียนจบได้ ${filtered.length} หลักสูตร` : `ยังไม่มีหลักสูตรที่จบใน ${time} นาที`;
  if (search) answer += ` สำหรับคำค้น “${query.trim()}”`;

  return (
    <section id="courses" className="catalog" aria-labelledby="courses-title">
      <div className="wrap grid">
        <div className="catalog-photo"><div className="catalog-photo-inner">
          {courses.map((c) => (
            <Image key={c.id} src={c.image} alt={c.id === current?.id ? c.alt : ""} aria-hidden={c.id !== current?.id} fill sizes="(min-width: 900px) 34vw, 100vw" className={`fade-img${c.id === current?.id ? " is-shown" : ""}`} />
          ))}
        </div></div>
        <div className="catalog-body">
          <Reveal as="h2" id="courses-title">เลือกหลักสูตร</Reveal>

          <fieldset className="time-picker">
            <legend>ฉันมีเวลา</legend>
            <div className="chips">
              {times.map((t) => (
                <button key={t} type="button" aria-pressed={time === t} onClick={() => setTime(t)}>{t ? `${t} นาที` : "ไม่จำกัด"}</button>
              ))}
            </div>
          </fieldset>

          <div className="catalog-tools">
            <div className="chips chips-small" role="group" aria-label="หมวดหมู่หลักสูตร">
              {categories.map((item) => <button type="button" key={item} aria-pressed={selected === item} onClick={() => setSelected(item)}>{item}</button>)}
            </div>
            <div className="catalog-fields">
              <label className="catalog-search"><Icon name="search" /><span className="sr-only">ค้นหาหลักสูตร</span><input type="search" value={query} placeholder="ค้นหาสิ่งที่อยากเรียน" onChange={(e) => setQuery(e.target.value)} /></label>
              <label className="sort-control"><span>เรียงตาม</span><select value={sort} onChange={(e) => setSort(e.target.value)}><option value="recommended">แนะนำ</option><option value="duration">ใช้เวลาน้อยก่อน</option></select></label>
            </div>
          </div>

          <p className="time-answer" role="status">{answer}</p>

          <ul className="course-rows">
            {filtered.map((c) => {
              const open = c.id === current?.id;
              return (
                <li key={c.id} className={open ? "is-active" : undefined}>
                  <button type="button" className="row-head" aria-expanded={open} aria-controls={`course-${c.id}`} onMouseEnter={() => setActive(c.id)} onFocus={() => setActive(c.id)} onClick={() => setActive(c.id)}>
                    <span className="row-title">{c.title}</span>
                    <span className="row-meta">{c.duration} นาที</span>
                  </button>
                  <div id={`course-${c.id}`} className="row-detail" hidden={!open}>
                    <p>{c.description}</p>
                    <p className="row-facts">{c.category} · {c.lessons} บทเรียน · สอนโดยฝ่ายฝึกอบรม</p>
                    <p className="row-note">หลักสูตรตัวอย่าง ยังไม่เปิดลงทะเบียน</p>
                  </div>
                </li>
              );
            })}
          </ul>

          {filtered.length === 0 && (
            <div className="empty-state">
              <h3>ยังไม่พบหลักสูตรที่ตรงกัน</h3>
              <p>ลองเพิ่มเวลา ใช้คำค้นอื่น หรือเลือกหมวดหมู่ทั้งหมด</p>
              <button type="button" className="button button-dark" onClick={() => { setQuery(""); setSelected("ทั้งหมด"); setTime(0); }}>ล้างตัวกรอง</button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
