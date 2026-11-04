import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { CourseCatalog } from "./components/course-catalog";
import { Crossfade, LoopVideo, Reveal } from "./components/motion";
import { courses, formatMinutes, totalLessons, totalMinutes } from "./data/courses";

const byId = (id: number) => courses.find((c) => c.id === id)!;
const heroImages = [1, 6].map((id) => ({ src: byId(id).image, alt: byId(id).alt }));
const shortest = [...courses].sort((a, b) => a.duration - b.duration).slice(0, 2);

const steps = [
  { line: "ก่อนอื่น สมัครสมาชิก", note: "ใช้อีเมลกับรหัสผ่าน หรือบัญชี Google ก็ได้" },
  { line: "จากนั้น เลือกหลักสูตร", note: "ค้นหาตามชื่อ ตามหมวด หรือตามเวลาที่คุณมีวันนี้" },
  { line: "แล้วเรียนทีละบท", note: "บทละประมาณสิบนาที เปิดจากมือถือระหว่างวันก็ได้" },
  { line: "สุดท้าย ทำแบบทดสอบ", note: "ตอบคำถามท้ายหลักสูตร เพื่อทบทวนสิ่งที่เพิ่งเรียนมา" },
];

const faqs = [
  { q: "เปิดให้เรียนเมื่อไร", a: "ตอนนี้เป็นช่วงทดลองระบบ หลักสูตรทั้งหกบนหน้านี้เป็นตัวอย่าง ฝ่ายฝึกอบรมจะประกาศวันเปิดเรียนอีกครั้ง" },
  { q: "ใครเรียนได้บ้าง", a: "บุคลากรทุกคนในองค์กร สมัครด้วยอีเมลกับรหัสผ่าน หรือเข้าสู่ระบบด้วยบัญชี Google" },
  { q: "ต้องใช้อุปกรณ์อะไร", a: "คอมพิวเตอร์ แท็บเล็ต หรือมือถือที่ต่ออินเทอร์เน็ตได้ ไม่ต้องติดตั้งโปรแกรมเพิ่ม" },
  { q: "หาหลักสูตรที่ใช่ได้อย่างไร", a: "ค้นหาจากชื่อ เลือกหมวดหมู่ที่สนใจ หรือเรียงตามระยะเวลา แล้วกดดูรายละเอียดหลักสูตรเพื่ออ่านเพิ่มเติม" },
  { q: "ติดต่อฝ่ายฝึกอบรมได้ที่ไหน", a: "ข้อมูลติดต่อฝ่ายฝึกอบรมจะประกาศให้ทราบเมื่อเปิดให้บริการ" },
];

export default function Home() {
  return (
    <>
      <section className="masthead" aria-labelledby="welcome-title">
        <div className="mosaic">
          <div className="mosaic-cell mosaic-main"><Crossfade images={heroImages} /></div>
          <div className="mosaic-cell"><LoopVideo src="/media/typing.webm" poster="/media/typing-poster.jpg" label="มือกำลังพิมพ์บนแป้นคีย์บอร์ดโน้ตบุ๊ก" /></div>
          <div className="mosaic-cell tile-accent"><p>30–60 นาที<br />ต่อหนึ่งหลักสูตร</p></div>
          <div className="mosaic-cell mosaic-extra"><Image src={byId(3).image} alt={byId(3).alt} fill sizes="25vw" /></div>
          <div className="mosaic-cell tile-paper mosaic-extra"><p>{totalLessons} บทเรียน<br />ใน {courses.length} หลักสูตร</p></div>
        </div>
        <div className="wrap grid masthead-body">
          <div className="masthead-title">
            <Reveal as="h1" id="welcome-title">เรียนจบ<br />ในพักเที่ยง</Reveal>
            <Reveal as="p" className="standfirst" d={1}>SmartLern คือห้องเรียนออนไลน์ของฝ่ายฝึกอบรม มี {courses.length} หลักสูตร หลักสูตรละไม่เกินหนึ่งชั่วโมง เรียนได้จาก<span className="nw">คอมพิวเตอร์</span> <span className="nw">แท็บเล็ต</span> และ<span className="nw">มือถือ</span></Reveal>
            <Reveal className="masthead-actions" d={2}>
              <a href="#courses" className="button button-primary">เลือกหลักสูตร</a>
              <Link href="/register" className="text-link">สมัครสมาชิก</Link>
            </Reveal>
          </div>
          <Reveal className="masthead-cards" d={3}>
            {shortest.map((c) => (
              <Link key={c.id} href={`/?q=${encodeURIComponent(c.title)}#courses`} className="mini-card">
                <span className="mini-card-photo"><Image src={c.image} alt={c.alt} fill sizes="(min-width: 900px) 16vw, 45vw" /></span>
                <span className="mini-card-bar"><span>{c.title}</span><span>{c.duration} นาที</span></span>
              </Link>
            ))}
          </Reveal>
        </div>
      </section>

      <section className="overview wrap" aria-labelledby="overview-title">
        <h2 id="overview-title" className="sr-only">ภาพรวมหลักสูตร</h2>
        <Reveal as="p" className="statement">
          หกหลักสูตรในสี่หมวด: <span className="nw">ความปลอดภัย <Slot id={1} /></span> <span className="nw">ทักษะดิจิทัล <Slot id={2} /></span> <span className="nw">การสื่อสาร <Slot id={3} /></span> <span className="nw">และการบริหาร <Slot id={5} /></span>
        </Reveal>
        <div className="grid overview-foot">
          <Reveal as="p" d={1}>แต่ละหลักสูตรมี 3–5 บทเรียน รวมทั้งหมด {totalLessons} บท ถ้าเรียนครบทุกหลักสูตรใช้เวลา {formatMinutes(totalMinutes)} แบ่งเรียนวันละหลักสูตรก็จบในหนึ่งสัปดาห์ทำงาน</Reveal>
        </div>
      </section>

      <Suspense fallback={<section id="courses" className="catalog-loading wrap" aria-busy="true"><h2>เลือกหลักสูตร</h2><p>กำลังโหลดหลักสูตร…</p></section>}>
        <CourseCatalog />
      </Suspense>

      <section className="steps" aria-labelledby="steps-title">
        <div className="wrap">
          {steps.map((s, i) => (
            <Reveal key={s.line} className="step grid">
              <div className="step-text" style={{ "--step": i } as React.CSSProperties}>
                {i === 0 ? <h2 id="steps-title" className="step-line"><Phrases text={s.line} /></h2> : <p className="step-line"><Phrases text={s.line} /></p>}
                <p className="step-note">{s.note}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="faq" aria-labelledby="faq-title">
        <div className="wrap faq-inner">
          <div className="faq-head">
            <h2 id="faq-title">คำถามที่พบบ่อย</h2>
          </div>
          <div className="faq-boxes">
            {faqs.map((faq) => (
              <details className="faq-box" key={faq.q}>
                <summary><span>{faq.q}</span><span className="faq-toggle" aria-hidden="true"/></summary>
                <p>{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function Slot({ id }: { id: number }) {
  const c = courses.find((x) => x.id === id)!;
  return <span className="slot"><Image src={c.image} alt={c.alt} fill sizes="120px" /></span>;
}

// ภาษาไทยไม่มีช่องว่างระหว่างคำ จึงกันไม่ให้วลีถูกตัดกลางคำ แต่ยังขึ้นบรรทัดใหม่ตรงช่องว่างได้
function Phrases({ text }: { text: string }) {
  return <>{text.split(" ").map((w, i) => <span key={i}>{i > 0 && " "}<span className="nw">{w}</span></span>)}</>;
}
