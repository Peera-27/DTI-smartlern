import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { AccountLink } from "./components/account-link";
import { CourseCatalog } from "./components/course-catalog";
import { Crossfade, LoopVideo, Reveal } from "./components/motion";
import { Icon } from "./components/icons";
import { courses, totalLessons } from "./data/courses";
import { news, org, pillars } from "./data/site";

const byId = (id: number) => courses.find((c) => c.id === id)!;
const heroImages = [1, 6].map((id) => ({ src: byId(id).image, alt: byId(id).alt }));
const shortest = [...courses].sort((a, b) => a.duration - b.duration).slice(0, 2);

const steps = [
  { line: "สมัครสมาชิก", note: "ใช้อีเมลกับรหัสผ่าน หรือบัญชี Google" },
  { line: "เลือกหลักสูตร", note: "ค้นหาทักษะที่สนใจ ตามเวลาที่คุณมี" },
  { line: "เรียนทีละบท", note: "บทเรียนสั้น เปิดเรียนได้ทุกอุปกรณ์" },
  { line: "ทำแบบทดสอบ", note: "ทบทวนความเข้าใจหลังเรียนจบ" },
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
            <Reveal as="h1" id="welcome-title">เพิ่มทักษะ<br />วันละนิด</Reveal>
            <Reveal as="p" className="standfirst" d={1}>หลักสูตรสั้น 30–60 นาที เรียนได้ทุกอุปกรณ์<br />สำรวจ {courses.length} หลักสูตรตัวอย่างจาก SmartLern ห้องเรียนออนไลน์ของฝ่ายฝึกอบรม</Reveal>
            <Reveal className="masthead-actions" d={2}>
              <a href="#courses" className="button button-primary">เลือกหลักสูตร</a>
              <Suspense fallback={<Link href="/register" className="text-link">สมัครสมาชิก</Link>}><AccountLink className="text-link" guest={<Link href="/register" className="text-link">สมัครสมาชิก</Link>} /></Suspense>
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

      <CourseCatalog />

      <section className="section section-alt" id="about" aria-labelledby="about-title">
        <div className="wrap section-inner">
          <div className="about-grid">
            <div className="section-head">
              <span className="eyebrow">ABOUT US</span>
              <h2 id="about-title">เกี่ยวกับ{org.unit}</h2>
            </div>
            <p className="about-intro">{org.intro}</p>
          </div>
          <ul className="pillars">
            {pillars.map((p) => (
              <li key={p.id} id={p.id} className="pillar">
                <span className="pillar-icon"><Icon name={p.icon} size={24} /></span>
                <h3><small>{p.label}</small>{p.title}</h3>
                <p>{p.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section" id="news" aria-labelledby="news-title">
        <div className="wrap section-inner">
          <div className="section-head">
            <span className="eyebrow">NEWS &amp; ACTIVITY</span>
            <h2 id="news-title">ข่าวสารและกิจกรรม</h2>
          </div>
          <ul className="news-grid">
            {news.map((n, i) => (
              <li key={i} className="news-card">
                <span className="news-photo"><Image src={n.image} alt="" fill sizes="(min-width: 900px) 33vw, 100vw" /></span>
                <div className="news-body">
                  <time dateTime={n.date}>{new Date(n.date).toLocaleDateString("th-TH", { dateStyle: "long" })}</time>
                  <h3>{n.href ? <a href={n.href}>{n.title}</a> : n.title}</h3>
                  <p>{n.excerpt}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="steps" aria-labelledby="steps-title">
        <div className="wrap steps-inner">
          <h2 id="steps-title">เริ่มเรียนใน 4 ขั้นตอน</h2>
          <p className="steps-intro">เมื่อเปิดให้บริการ คุณเริ่มเรียนได้ง่าย ๆ ตามขั้นตอนนี้</p>
          <ol className="steps-list">
          {steps.map((s, i) => (
            <li key={s.line} className="step">
              <span className="step-number" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
              <div className="step-text">
                <h3 className="step-line">{s.line}</h3>
                <p className="step-note">{s.note}</p>
              </div>
            </li>
          ))}
          </ol>
          <div className="steps-actions"><a href="#courses" className="button steps-button">เลือกหลักสูตร</a></div>
        </div>
      </section>

      <section className="faq" id="faq" aria-labelledby="faq-title">
        <div className="wrap faq-inner">
          <div className="faq-head section-head">
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

      <section className="section section-alt" id="contact" aria-labelledby="contact-title">
        <div className="wrap section-inner">
          <div className="section-head">
            <span className="eyebrow">GET IN TOUCH</span>
            <h2 id="contact-title">ติดต่อเรา</h2>
          </div>
          <ul className="contact-grid">
            <li className="contact-card"><span className="pillar-icon"><Icon name="book" size={22} /></span><div><h3>ที่อยู่</h3><p>{org.name}<br />{org.address}</p></div></li>
            <li className="contact-card"><span className="pillar-icon"><Icon name="clock" size={22} /></span><div><h3>โทรศัพท์</h3><p>{org.phone}<br />{org.hours}</p></div></li>
            <li className="contact-card"><span className="pillar-icon"><Icon name="chat" size={22} /></span><div><h3>อีเมล</h3><p>{org.email}</p></div></li>
          </ul>
        </div>
      </section>
    </>
  );
}

