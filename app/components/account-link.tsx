import Link from "next/link";
import type { ReactNode } from "react";
import { connection } from "next/server";
import { auth } from "@/auth";

/** ล็อกอินแล้วแสดงลิงก์แดชบอร์ด ยังไม่ล็อกอินแสดง guest ต้องครอบด้วย <Suspense fallback={guest}> */
export async function AccountLink({ className, guest }: { className?: string; guest: ReactNode }) {
  // auth() อ่าน cookie จึงต้อง render ตอน request
  await connection();
  const session = await auth();
  return session?.user ? (
    <Link href="/dashboard" className={className}>
      แดชบอร์ด
    </Link>
  ) : (
    guest
  );
}
