"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Icon, type IconName } from "./icons";

const categories = ["ทั้งหมด", "ความปลอดภัย", "ทักษะดิจิทัล", "การสื่อสาร", "การบริหาร"];
const courses: { id: number; title: string; category: string; icon: IconName; duration: number; lessons: number; description: string }[] = [
  { id: 1, title: "ความปลอดภัยในการทำงาน", category: "ความปลอดภัย", icon: "shield", duration: 45, lessons: 4, description: "เรียนรู้การประเมินความเสี่ยง แนวปฏิบัติในการทำงานอย่างปลอดภัย และการเลือกใช้อุปกรณ์ป้องกันส่วนบุคคล" },
  { id: 2, title: "การใช้เครื่องมือดิจิทัล", category: "ทักษะดิจิทัล", icon: "screen", duration: 60, lessons: 5, description: "จัดการเอกสาร ทำงานร่วมกันผ่านเครื่องมือออนไลน์ และเลือกใช้เครื่องมือดิจิทัลให้เหมาะกับงานประจำวัน" },
  { id: 3, title: "ทักษะการสื่อสารในทีม", category: "การสื่อสาร", icon: "chat", duration: 45, lessons: 4, description: "ฝึกการฟังอย่างเข้าใจ สื่อสารให้ชัดเจน และให้ความคิดเห็นอย่างสร้างสรรค์ เพื่อการทำงานร่วมกันที่ดีขึ้น" },
  { id: 4, title: "การคุ้มครองข้อมูลส่วนบุคคล", category: "ความปลอดภัย", icon: "shield", duration: 40, lessons: 4, description: "ทำความเข้าใจการดูแลข้อมูลส่วนบุคคล เรียนรู้จากสถานการณ์จำลอง และแนวทางจัดการข้อมูลภายในองค์กร" },
  { id: 5, title: "บริหารเวลาให้มีประสิทธิภาพ", category: "การบริหาร", icon: "chart", duration: 30, lessons: 3, description: "จัดลำดับความสำคัญ วางแผนงาน และสร้างวิธีทำงานที่เหมาะกับเป้าหมายของคุณ" },
  { id: 6, title: "การบริการลูกค้าอย่างเข้าใจ", category: "การสื่อสาร", icon: "chat", duration: 45, lessons: 4, description: "เข้าใจความต้องการของลูกค้า ฝึกการสื่อสารเชิงบวก และรับมือกับสถานการณ์ที่ท้าทายผ่านตัวอย่าง" },
];

export function CourseCatalog() {
  const params = useSearchParams();
  return <Catalog key={params.toString()} initialQuery={params.get("q") ?? ""} initialCategory={params.get("category") ?? "ทั้งหมด"}/>;
}

function Catalog({ initialQuery, initialCategory }: { initialQuery: string; initialCategory: string }) {
  const [selected, setSelected] = useState(categories.includes(initialCategory) ? initialCategory : "ทั้งหมด");
  const [query, setQuery] = useState(initialQuery);
  const [sort, setSort] = useState("recommended");


  const activeCategory = selected;
  const search = query.trim().toLocaleLowerCase("th");
  const filtered = courses.filter((course) => (activeCategory === "ทั้งหมด" || course.category === activeCategory) && `${course.title} ${course.category} ${course.description}`.toLocaleLowerCase("th").includes(search));
  if (sort === "duration") filtered.sort((a, b) => a.duration - b.duration);

  return (
    <section id="courses" className="catalog-section" aria-labelledby="courses-title">
      <div className="interest-bar"><span>เลือกตามความสนใจ</span><div className="category-list" role="group" aria-label="หมวดหมู่หลักสูตร">
        {categories.map((item) => <button type="button" key={item} aria-pressed={activeCategory === item} onClick={() => setSelected(item)}>{item}</button>)}
      </div></div>
      <div className="section-heading"><div><p className="eyebrow">LEARN SOMETHING NEW</p><h2 id="courses-title">หลักสูตรแนะนำ</h2><p>คัดสรรเพื่อพัฒนาทักษะของคุณ ให้พร้อมสำหรับทุกโอกาส</p></div><span className="sample-label">หลักสูตรตัวอย่าง</span></div>
      <div className="catalog-tools">
        <label className="catalog-search"><Icon name="search"/><span className="sr-only">ค้นหาหลักสูตร</span><input type="search" value={query} placeholder="ค้นหาสิ่งที่อยากเรียน…" onChange={(event) => setQuery(event.target.value)}/></label>
        <label className="sort-control"><span>เรียงตาม</span><select value={sort} onChange={(event) => setSort(event.target.value)}><option value="recommended">แนะนำ</option><option value="duration">ระยะเวลาสั้นที่สุด</option></select></label>
      </div>
      <p className="results-count" role="status">พบ {filtered.length} หลักสูตร{search && <> สำหรับ “{search}”</>}</p>
      <div className="course-grid">
        {filtered.map((course) => <article className="course-card" key={course.id}>
          <div className={`course-cover cover-${course.icon}`}><span className="cover-category">{course.category}</span><div className="cover-icon"><Icon name={course.icon} size={58}/></div><span className="cover-number">0{course.id} / SMARTLERN</span><span className="cover-decoration" aria-hidden="true"/></div>
          <div className="course-info"><p className="course-kicker">หลักสูตรพัฒนาบุคลากร</p><h3>{course.title}</h3><p className="course-description">{course.description}</p><div className="course-meta"><span><Icon name="clock" size={16}/>{course.duration} นาที</span><span><Icon name="book" size={16}/>{course.lessons} บทเรียน</span></div><details className="course-details"><summary>ดูรายละเอียด <Icon name="arrow" size={17}/></summary><div><p>{course.description}</p><p>ผู้สอน: ฝ่ายฝึกอบรม</p><p className="demo-note">หลักสูตรจำลองสำหรับแสดงตัวอย่าง ยังไม่เปิดลงทะเบียนเรียน</p></div></details></div>
        </article>)}
      </div>
      {filtered.length === 0 && <div className="empty-state"><Icon name="search" size={36}/><h3>ยังไม่พบหลักสูตรที่ค้นหา</h3><p>ลองใช้คำค้นอื่น หรือเลือกหมวดหมู่ทั้งหมด</p><button className="button button-outline" onClick={() => { setQuery(""); setSelected("ทั้งหมด"); }}>ล้างตัวกรอง</button></div>}
    </section>
  );
}
