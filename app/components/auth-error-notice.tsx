"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

// แปลง ?error=... ที่ Auth.js ส่งกลับมาหน้า login เป็นข้อความภาษาไทย
const messages: Record<string, string> = {
  OAuthAccountNotLinked: "บัญชี Google นี้ผูกกับผู้ใช้อื่นอยู่แล้ว กรุณาเข้าสู่ระบบด้วยบัญชีนั้น",
  AccessDenied: "ไม่ได้รับอนุญาตให้เข้าสู่ระบบ",
  Configuration: "ระบบเข้าสู่ระบบตั้งค่าไม่ถูกต้อง กรุณาติดต่อผู้ดูแล",
};

export function AuthErrorNotice() {
  return <Suspense fallback={null}><AuthErrorNoticeWithSearchParams /></Suspense>;
}

function AuthErrorNoticeWithSearchParams() {
  const code = useSearchParams().get("error");
  if (!code) return null;
  return (
    <p className="auth-feedback" role="alert">
      {messages[code] ?? "เข้าสู่ระบบไม่สำเร็จ กรุณาลองใหม่อีกครั้ง"}
    </p>
  );
}
