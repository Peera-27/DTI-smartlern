import type { Metadata } from "next";
import localFont from "next/font/local";
import Link from "next/link";
import { SiteHeader } from "./components/site-header";
import { photoCredits } from "./data/courses";
import "./globals.css";

const displayFont = localFont({
  src: [
    { path: "./fonts/IBMPlexSansThai-SemiBold.ttf", weight: "600", style: "normal" },
    { path: "./fonts/IBMPlexSansThai-Bold.ttf", weight: "700", style: "normal" },
  ],
  variable: "--font-display",
  display: "swap",
});
const textFont = localFont({
  src: [
    { path: "./fonts/IBMPlexSansThaiLooped-Regular.ttf", weight: "400", style: "normal" },
    { path: "./fonts/IBMPlexSansThaiLooped-Medium.ttf", weight: "500", style: "normal" },
    { path: "./fonts/IBMPlexSansThaiLooped-SemiBold.ttf", weight: "600", style: "normal" },
  ],
  variable: "--font-text",
  display: "swap",
});

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
