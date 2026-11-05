"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/admin", label: "หลักสูตร", match: /^\/admin(\/courses|\/lessons|$)/ },
  { href: "/admin/users", label: "ผู้ใช้", match: /^\/admin\/users/ },
  { href: "/admin/certificates", label: "ใบประกาศ", match: /^\/admin\/certificates/ },
];

export function NavLinks({ pathname = "" }: { pathname?: string }) {
  return (
    <nav aria-label="เมนูผู้ดูแลระบบ" className="admin-nav">
      {items.map((i) => (
        <Link key={i.href} href={i.href} aria-current={i.match.test(pathname) ? "page" : undefined}>
          {i.label}
        </Link>
      ))}
    </nav>
  );
}

/** usePathname ต้องอยู่ใน Suspense (route แบบ dynamic) จึงแยกเป็น component นี้ */
export function AdminNav() {
  return <NavLinks pathname={usePathname()} />;
}
