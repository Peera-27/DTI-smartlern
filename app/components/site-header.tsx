"use client";
import Image from "next/image";
import Link from "next/link";
import utcLogo from "../images/utc icon.png";
import { usePathname } from "next/navigation";
import { Suspense, useRef, useState, type ReactNode } from "react";
import { categories } from "../data/courses";
import { org } from "../data/site";
import { Icon } from "./icons";

/** account = ลิงก์บัญชีจากฝั่งเซิร์ฟเวอร์ (AccountLink) เพราะ header นี้เป็น client component */
export function SiteHeader({ account }: { account: ReactNode }) {
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  return (
    <header className="site-header" id="top">
      <div className="topbar">
        <div className="wrap topbar-inner">
          <span>{org.name}</span>
          <span className="topbar-contact">โทร {org.phone} · {org.hours}</span>
        </div>
      </div>
      <div className="wrap header-inner">
        <Link href="/" className="brand" aria-label="UTC หน้าแรก" onClick={() => setOpen(false)}><Image src={utcLogo} alt="UTC" loading="eager" style={{ width: 88, height: 64, objectFit: "contain" }} /><span className="brand-text"><span>{org.unit}</span><small>{org.nameEn}</small></span></Link>
        <button ref={toggle} className="menu-toggle" type="button" aria-expanded={open} aria-controls="main-navigation" onClick={() => setOpen(!open)}>{open ? "ปิดเมนู" : "เมนู"}</button>
        <nav id="main-navigation" aria-label="เมนูหลัก" className={`main-navigation${open ? " is-open" : ""}`} onKeyDown={(event) => { if (event.key === "Escape") { setOpen(false); toggle.current?.focus(); } }}>
          <Link className="nav-link" href="/#courses" onClick={() => setOpen(false)}>หลักสูตร</Link>
          <details className="category-dropdown">
            <summary>หมวดหมู่</summary>
            <div className="dropdown-panel">
              {categories.map((category) => <Link key={category} href={category === "ทั้งหมด" ? "/#courses" : `/?category=${encodeURIComponent(category)}#courses`} onClick={(event) => { setOpen(false); event.currentTarget.closest("details")?.removeAttribute("open"); }}>{category}</Link>)}
            </div>
          </details>
          {[["#about", "เกี่ยวกับ"], ["#news", "ข่าวสาร"], ["#faq", "ถามตอบ"], ["#contact", "ติดต่อ"]].map(([hash, label]) => <Link key={hash} className="nav-link" href={`/${hash}`} onClick={() => setOpen(false)}>{label}</Link>)}
          <form className="header-search" action="/#courses" method="get" role="search">
            <label className="sr-only" htmlFor="header-search">ค้นหาหลักสูตร</label>
            <input id="header-search" name="q" type="search" placeholder="ค้นหาหลักสูตร" />
            <button type="submit" aria-label="ค้นหา" onClick={() => setOpen(false)}><Icon name="search" size={20} /></button>
          </form>
          <span style={{ display: "contents" }} onClick={() => setOpen(false)}>{account}</span>
        </nav>
      </div>
    </header>
  );
}

// usePathname รอ URL จริงในหน้า dynamic route จึงแยกมาครอบ Suspense ไม่ให้ทั้ง header ต้องรอ
export function LoginButton() {
  return <Suspense fallback={<Link href="/login" className="login-button">เข้าสู่ระบบ</Link>}><LoginLink /></Suspense>;
}

function LoginLink() {
  const pathname = usePathname();
  return <Link href="/login" className="login-button" aria-current={pathname === "/login" ? "page" : undefined}>เข้าสู่ระบบ</Link>;
}
