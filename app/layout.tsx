import type { Metadata } from "next";
import { Noto_Sans_Thai, Noto_Serif_Thai } from "next/font/google";
import Link from "next/link";
import { SiteHeader } from "./components/site-header";
import { photoCredits } from "./data/courses";
import "./globals.css";

const displayFont = Noto_Sans_Thai({ variable: "--font-display", weight: ["700", "800"], subsets: ["thai", "latin"], display: "swap" });
const textFont = Noto_Serif_Thai({ variable: "--font-text", weight: ["400", "600"], subsets: ["thai", "latin"], display: "swap" });

export const metadata: Metadata = {
  title: { default: "SmartLern | หลักสูตรสั้นสำหรับบุคลากร", template: "%s | SmartLern" },
  description: "ห้องเรียนออนไลน์ของฝ่ายฝึกอบรม หลักสูตรละ 30–60 นาที เรียนได้ทุกอุปกรณ์",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="th" className={`${displayFont.variable} ${textFont.variable}`}>
      <body>
        <a className="skip-link" href="#main-content">ข้ามไปเนื้อหาหลัก</a>
        <SiteHeader />
        <main id="main-content" className="site-main" tabIndex={-1}>{children}</main>
        <footer className="site-footer">
          <div className="wrap">
            <p className="footer-name" aria-hidden="true">SmartLern</p>
            <div className="grid footer-row">
              <nav className="footer-places" aria-label="ลิงก์ท้ายเว็บ">
                <Link href="/#courses">หลักสูตรทั้งหมด</Link>
                <Link href="/login">เข้าสู่ระบบ</Link>
                <Link href="/register">สมัครสมาชิก</Link>
              </nav>
              <div className="footer-credits">
                <h2>ภาพประกอบ</h2>
                <ul>
                  {photoCredits.map((c) => (
                    <li key={c.href}><a href={c.href} target="_blank" rel="noreferrer">“{c.title}”</a> โดย {c.by}, {c.licence}</li>
                  ))}
                </ul>
                <p>ภาพปรับเป็นขาวดำ</p>
              </div>
            </div>
            <div className="footer-legal">
              <span>© 2569 SmartLern · ฝ่ายฝึกอบรม</span>
              <a href="#top">กลับขึ้นด้านบน</a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
