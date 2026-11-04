import type { Metadata } from "next";
import { IBM_Plex_Sans_Thai_Looped, Prompt } from "next/font/google";
import Link from "next/link";
import { SiteHeader } from "./components/site-header";
import "./globals.css";

const thaiFont = IBM_Plex_Sans_Thai_Looped({ variable: "--font-thai", weight: ["400", "500", "600"], subsets: ["thai", "latin"], display: "swap" });
const headingFont = Prompt({ variable: "--font-heading", weight: ["500", "600", "700"], subsets: ["thai", "latin"], display: "swap" });
export const metadata: Metadata = {
  title: { default: "SmartLern | เรียนรู้ สู่โอกาสใหม่", template: "%s | SmartLern" },
  description: "พื้นที่เรียนรู้ออนไลน์ พัฒนาทักษะและต่อยอดความรู้ในแบบของคุณ",
};
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="th" className={`${thaiFont.variable} ${headingFont.variable}`}>
      <body>
        <a className="skip-link" href="#main-content">ข้ามไปเนื้อหาหลัก</a>
        <SiteHeader />
        <main id="main-content" className="site-main" tabIndex={-1}>{children}</main>
        <footer className="site-footer">
          <div className="container footer-inner">
            <div>
              <Link href="/" className="brand">Smart<span>Lern</span>.</Link>
              <p>เรียนรู้ได้ทุกวัน เติบโตได้ในแบบของคุณ</p>
            </div>
            <nav className="footer-links" aria-label="ข้อมูลเว็บไซต์">
              <details><summary>เกี่ยวกับเรา</summary><p>SmartLern คือพื้นที่เรียนรู้สำหรับทุกคนในองค์กร เพื่อพัฒนาทักษะที่ใช้ได้จริงในการทำงาน</p></details>
              <details><summary>คู่มือการใช้งาน</summary><p>ค้นหาหรือเลือกหมวดหมู่ที่สนใจ แล้วกดดูรายละเอียดหลักสูตร ขณะนี้แสดงหลักสูตรตัวอย่างเพื่อทดลองใช้งาน</p></details>
              <details><summary>ติดต่อฝ่ายฝึกอบรม</summary><p>ข้อมูลติดต่อฝ่ายฝึกอบรมจะประกาศให้ทราบเมื่อเปิดให้บริการ</p></details>
            </nav>
          </div>
        </footer>
      </body>
    </html>
  );
}
