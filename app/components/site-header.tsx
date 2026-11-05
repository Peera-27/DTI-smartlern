"use client";
import Image from "next/image";
import Link from "next/link";
import utcLogo from "../../images/utc icon.png";
import { usePathname } from "next/navigation";
import { useRef, useState } from "react";
import { categories } from "../data/courses";
import { Icon } from "./icons";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();
  return (
    <header className="site-header" id="top">
      <div className="wrap header-inner">
        <Link href="/" className="brand" aria-label="UTC หน้าแรก" onClick={() => setOpen(false)}><Image src={utcLogo} alt="UTC" className="brand-logo" loading="eager" sizes="88px" /></Link>
        <button ref={toggle} className="menu-toggle" type="button" aria-expanded={open} aria-controls="main-navigation" onClick={() => setOpen(!open)}>{open ? "ปิดเมนู" : "เมนู"}</button>
        <nav id="main-navigation" aria-label="เมนูหลัก" className={`main-navigation${open ? " is-open" : ""}`} onKeyDown={(event) => { if (event.key === "Escape") { setOpen(false); toggle.current?.focus(); } }}>
          <Link className="nav-link" href="/#courses" onClick={() => setOpen(false)}>หลักสูตร</Link>
          <details className="category-dropdown">
            <summary>หมวดหมู่</summary>
            <div className="dropdown-panel">
              {categories.map((category) => <Link key={category} href={category === "ทั้งหมด" ? "/#courses" : `/?category=${encodeURIComponent(category)}#courses`} onClick={(event) => { setOpen(false); event.currentTarget.closest("details")?.removeAttribute("open"); }}>{category}</Link>)}
            </div>
          </details>
          <form className="header-search" action="/#courses" method="get" role="search">
            <label className="sr-only" htmlFor="header-search">ค้นหาหลักสูตร</label>
            <input id="header-search" name="q" type="search" placeholder="ค้นหาหลักสูตร" />
            <button type="submit" aria-label="ค้นหา" onClick={() => setOpen(false)}><Icon name="search" size={20} /></button>
          </form>
          <Link href="/login" className="login-button" aria-current={pathname === "/login" ? "page" : undefined} onClick={() => setOpen(false)}>เข้าสู่ระบบ</Link>
        </nav>
      </div>
    </header>
  );
}
