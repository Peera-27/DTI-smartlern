"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useState } from "react";
import { Icon } from "./icons";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();
  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link href="/" className="brand" aria-label="SmartLern หน้าแรก" onClick={() => setOpen(false)}><span className="brand-symbol"><Icon name="book" size={23}/></span>Smart<span>Lern</span><span className="brand-dot">.</span></Link>
        <button ref={toggle} className="menu-toggle" type="button" aria-expanded={open} aria-controls="main-navigation" onClick={() => setOpen(!open)}><span aria-hidden="true">{open ? "✕" : "☰"}</span> {open ? "ปิดเมนู" : "เมนู"}</button>
        <nav id="main-navigation" aria-label="เมนูหลัก" className={`main-navigation${open ? " is-open" : ""}`} onKeyDown={(event) => { if (event.key === "Escape") { setOpen(false); toggle.current?.focus(); } }}>
          <Link className="nav-link" href="/" aria-current={pathname === "/" ? "page" : undefined} onClick={() => setOpen(false)}>หน้าหลัก</Link>
          <details className="category-dropdown"><summary>หมวดหมู่ <span aria-hidden="true">⌄</span></summary><div className="dropdown-panel">{["ทั้งหมด", "ความปลอดภัย", "ทักษะดิจิทัล", "การสื่อสาร", "การบริหาร"].map((category) => <Link key={category} href={category === "ทั้งหมด" ? "/#courses" : `/?category=${encodeURIComponent(category)}#courses`} onClick={(event) => { setOpen(false); event.currentTarget.closest("details")?.removeAttribute("open"); }}>{category}</Link>)}</div></details>
          <form className="header-search" action="/#courses" method="get" role="search"><label className="sr-only" htmlFor="header-search">ค้นหาคอร์สเรียน</label><input id="header-search" name="q" type="search" placeholder="ค้นหาคอร์สเรียน…"/><button type="submit" aria-label="ค้นหา" onClick={() => setOpen(false)}><Icon name="search" size={19}/></button></form>
          <span className="language-label" aria-label="ภาษาไทย">TH</span>
          <Link href="/login" className="login-button" aria-current={pathname === "/login" ? "page" : undefined} onClick={() => setOpen(false)}>เข้าสู่ระบบ</Link>
        </nav>
      </div>
    </header>
  );
}
