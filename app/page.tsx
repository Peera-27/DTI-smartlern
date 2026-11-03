import { Suspense } from "react";
import { CourseCatalog } from "./components/course-catalog";
import { Icon } from "./components/icons";

export default function Home() {
  return (
    <div className="container home-page">
      <section className="hero" aria-labelledby="welcome-title">
        <div className="hero-content">
          <p className="hero-label"><span/>พื้นที่การเรียนรู้สำหรับทุกคนในองค์กร</p>
          <h1 id="welcome-title">พัฒนาทักษะวันนี้<br/><span>เติบโตไปด้วยกัน</span></h1>
          <p className="hero-description">เรียนรู้ได้ทุกที่ พร้อมหลักสูตรที่นำไปใช้กับงานได้จริง<br className="desktop-break"/> เริ่มต้นสิ่งใหม่ ในจังหวะที่ใช่สำหรับคุณ</p>
          <a href="#courses" className="button button-primary">สำรวจหลักสูตร <Icon name="arrow" size={19}/></a>
          <div className="hero-benefits"><span><Icon name="check" size={16}/>เรียนรู้ได้ทุกอุปกรณ์</span><span><Icon name="check" size={16}/>ต่อยอดทักษะการทำงาน</span></div>
        </div>
        <div className="hero-visual" aria-hidden="true">
          <div className="visual-orbit orbit-one"/><div className="visual-orbit orbit-two"/>
          <div className="learning-window"><div className="window-top"><span/><span/><span/><small>YOUR LEARNING SPACE</small></div><div className="window-content"><div className="window-illustration"><Icon name="book" size={72}/><span className="illustration-spark">✦</span></div><p>ทุกการเรียนรู้ คือการเติบโต</p><div className="mock-line"/><div className="mock-line short"/><div className="mock-progress"><span/></div><div className="window-bottom"><span>ก้าวต่อไปของคุณ เริ่มที่นี่</span><span className="mock-play"><Icon name="play" size={15}/></span></div></div></div>
          <div className="floating-note note-skills"><span className="note-icon"><Icon name="chart" size={23}/></span><div><strong>ทักษะใหม่ โอกาสใหม่</strong><small>เรียนรู้เพื่อตัวคุณในวันข้างหน้า</small></div></div>
          <div className="floating-note note-learn"><span className="note-icon"><Icon name="check" size={22}/></span><div><strong>เรียนได้ในแบบคุณ</strong><small>ทุกที่ ทุกเวลา</small></div></div>
        </div>
      </section>
      <Suspense fallback={<section id="courses" className="catalog-loading" aria-busy="true">กำลังโหลดหลักสูตร…</section>}><CourseCatalog/></Suspense>
      <section className="news-section" aria-labelledby="news-title"><div className="news-heading"><span className="news-icon"><Icon name="chat" size={22}/></span><h2 id="news-title">ข่าวสารและประกาศ</h2></div><details className="news-item"><summary><span className="news-tag">ประกาศตัวอย่าง</span><span>เตรียมพบกับหลักสูตรพัฒนาทักษะสำหรับทุกคนในองค์กร</span><Icon name="arrow" size={20}/></summary><p>ขณะนี้เว็บไซต์อยู่ระหว่างการพัฒนา คุณสามารถทดลองค้นหาและดูรายละเอียดหลักสูตรตัวอย่างได้ โดยกำหนดการเปิดเรียนจะแจ้งให้ทราบอีกครั้ง</p></details></section>
    </div>
  );
}
