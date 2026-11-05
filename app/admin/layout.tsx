import Link from "next/link";
import { Suspense } from "react";
import { AdminNav, NavLinks } from "./admin-nav";

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="admin-shell">
      <aside className="admin-side">
        <Link href="/admin" className="admin-brand">
          SmartLern
          <span>ผู้ดูแลระบบ</span>
        </Link>
        <Suspense fallback={<NavLinks />}>
          <AdminNav />
        </Suspense>
        <Link href="/dashboard" className="admin-side-foot">
          กลับไปหน้าโปรไฟล์
        </Link>
      </aside>
      <div className="admin-main">{children}</div>
    </div>
  );
}
