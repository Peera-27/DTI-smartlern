import type { Metadata } from "next";
import localFont from "next/font/local";
import Link from "next/link";
import { Suspense } from "react";
import { AccountLink } from "./components/account-link";
import { LoginButton, SiteHeader } from "./components/site-header";
import Image from "next/image";
import { photoCredits } from "./data/courses";
import { org } from "./data/site";
import utcLogo from "./images/utc icon.png";
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

// URL หลักของเว็บ ใช้ต่อกับลิงก์ relative ใน canonical / og:image
// ตั้ง SITE_URL ใน env ตอน deploy (บน Vercel ถ้าไม่ตั้งจะใช้โดเมน production ให้อัตโนมัติ)
const siteUrl =
  process.env.SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "SmartLern | หลักสูตรสั้นสำหรับบุคลากร", template: "%s | SmartLern" },
  description: "ห้องเรียนออนไลน์ของฝ่ายฝึกอบรม หลักสูตรละ 30–60 นาที เรียนได้ทุกอุปกรณ์",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="th" data-scroll-behavior="smooth" className={`${displayFont.variable} ${textFont.variable}`}>
      <body>
        <a className="skip-link" href="#main-content">ข้ามไปเนื้อหาหลัก</a>
        <SiteHeader account={<Suspense fallback={<LoginButton />}><AccountLink className="login-button" guest={<LoginButton />} /></Suspense>} />
        <main id="main-content" className="site-main" tabIndex={-1}>{children}</main>
        <footer className="site-footer">
          <div className="wrap">
            <div className="footer-cols">
              <div className="footer-org">
                <Image src={utcLogo} alt="" style={{ width: 72, height: 52, objectFit: "contain" }} />
                <div><strong>{org.unit}</strong><p>{org.name}<br />{org.address}</p></div>
              </div>
              <div className="footer-col">
                <h2>เมนู</h2>
                <nav className="footer-places" aria-label="ลิงก์ท้ายเว็บ">
                  <Link href="/#courses">หลักสูตรทั้งหมด</Link>
                  <Link href="/#about">เกี่ยวกับ</Link>
                  <Link href="/#news">ข่าวสาร</Link>
                  <Link href="/#faq">ถามตอบ</Link>
                </nav>
              </div>
              <div className="footer-col">
                <h2>ติดต่อ</h2>
                <p>โทร {org.phone}<br />อีเมล {org.email}<br />{org.hours}</p>
              </div>
            </div>
            <details className="footer-credits">
              <summary>ภาพประกอบ</summary>
              <ul>
                {photoCredits.map((c) => (
                  <li key={c.href}><a href={c.href} target="_blank" rel="noreferrer">“{c.title}”</a> โดย {c.by}, {c.licence}</li>
                ))}
              </ul>
            </details>
            <div className="footer-legal">
              <span>© 2569 {org.unit} · {org.name} · <Link href="/privacy">นโยบายความเป็นส่วนตัว</Link></span>
              <a href="#top">กลับขึ้นด้านบน</a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
