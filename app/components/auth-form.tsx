"use client";

import Link from "next/link";
import { useState, useTransition, type FormEvent } from "react";
import { loginWithCredentials, loginWithGoogle } from "../login/actions";
import { Icon } from "./icons";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const register = mode === "register";
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = new FormData(form);
    if (register && !String(values.get("name") ?? "").trim()) {
      const name = form.elements.namedItem("name") as HTMLInputElement;
      name.setCustomValidity("กรุณากรอกชื่อและนามสกุล");
      name.reportValidity();
      return;
    }
    if (register && values.get("password") !== values.get("confirmPassword")) {
      const confirm = form.elements.namedItem("confirmPassword") as HTMLInputElement;
      confirm.setCustomValidity("รหัสผ่านทั้งสองช่องไม่ตรงกัน");
      confirm.reportValidity();
      return;
    }
    const email = String(values.get("email") ?? "");
    const password = String(values.get("password") ?? "");
    setMessage("");
    startTransition(async () => {
      if (register) {
        const res = await fetch("/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: String(values.get("name") ?? "").trim(), email, password }),
        }).catch(() => null);
        if (!res?.ok) {
          const data = await res?.json().catch(() => null);
          setMessage(data?.error ?? "สมัครสมาชิกไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
          return;
        }
      }
      const result = await loginWithCredentials(email, password);
      if (result?.error) setMessage(result.error);
    });
  }

  return (
    <div className="container auth-page">
      <Link href="/" className="auth-back">← กลับหน้าหลัก</Link>
      <div className="auth-shell">
        <aside className="auth-intro" aria-label="เรียนรู้ไปกับ SmartLern">
          <span className="auth-book"><Icon name="book" size={42}/></span>
          <p className="eyebrow">YOUR NEXT CHAPTER</p>
          <h2>ทุกการเรียนรู้<br/><span>เปิดโอกาสใหม่เสมอ</span></h2>
          <p>เติมทักษะที่ใช่ ให้พร้อมสำหรับวันข้างหน้า<br/>เริ่มต้นเส้นทางการเรียนรู้ไปกับ SmartLern</p>
          <ul className="auth-benefits">
            <li><Icon name="check" size={18}/>หลักสูตรสำหรับการทำงานจริง</li>
            <li><Icon name="check" size={18}/>เรียนรู้ได้ทั้งคอม แท็บเล็ต และมือถือ</li>
            <li><Icon name="check" size={18}/>เติบโตไปพร้อมกับคนในองค์กร</li>
          </ul>
          <span className="auth-intro-note">LEARN TODAY. GROW TOGETHER.</span>
        </aside>
        <section className="auth-panel" aria-labelledby="auth-title">
          <div className="auth-tabs" aria-label="เลือกหน้า">
            <Link href="/login" aria-current={!register ? "page" : undefined}>เข้าสู่ระบบ</Link>
            <Link href="/register" aria-current={register ? "page" : undefined}>สมัครสมาชิก</Link>
          </div>
          <h1 id="auth-title">{register ? "เริ่มต้นการเรียนรู้ของคุณ" : "ยินดีต้อนรับกลับมา"}</h1>
          <p className="auth-description">{register ? "สร้างบัญชีเพื่อเตรียมพร้อมสำหรับโอกาสใหม่" : "เข้าสู่ระบบเพื่อเดินหน้าการเรียนรู้ของคุณ"}</p>
          <form onSubmit={handleSubmit} onInput={() => setMessage("")} className="auth-form">
            {register && <div className="form-field"><label htmlFor="full-name">ชื่อ–นามสกุล</label><input id="full-name" name="name" autoComplete="name" placeholder="ชื่อและนามสกุลของคุณ" required maxLength={100} onChange={(event) => event.currentTarget.setCustomValidity("")}/></div>}
            <div className="form-field"><label htmlFor="email">อีเมล</label><input id="email" name="email" type="email" autoComplete="email" placeholder="you@example.com" required maxLength={254}/></div>
            <div className="form-field"><label htmlFor="password">รหัสผ่าน</label><div className="password-field"><input id="password" name="password" type={showPassword ? "text" : "password"} autoComplete={register ? "new-password" : "current-password"} placeholder={register ? "ตั้งรหัสผ่านอย่างน้อย 8 ตัวอักษร" : "กรอกรหัสผ่านของคุณ"} required minLength={register ? 8 : undefined} maxLength={register ? 72 : undefined} aria-describedby={register ? "password-help" : undefined} onChange={(event) => { const confirm = event.currentTarget.form?.elements.namedItem("confirmPassword") as HTMLInputElement | null; confirm?.setCustomValidity(""); }}/><button type="button" aria-label={showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"} aria-pressed={showPassword} onClick={() => setShowPassword(!showPassword)}>{showPassword ? "ซ่อน" : "แสดง"}</button></div>{register && <small id="password-help">ใช้รหัสผ่านอย่างน้อย 8 ตัวอักษร</small>}</div>
            {register && <div className="form-field"><label htmlFor="confirm-password">ยืนยันรหัสผ่าน</label><input id="confirm-password" name="confirmPassword" type={showPassword ? "text" : "password"} autoComplete="new-password" placeholder="กรอกรหัสผ่านอีกครั้ง" required minLength={8} maxLength={72} onChange={(event) => event.currentTarget.setCustomValidity("")}/></div>}
            <button type="submit" className="button button-primary auth-submit" disabled={pending}>{pending ? "กำลังดำเนินการ..." : register ? "สมัครสมาชิก" : "เข้าสู่ระบบ"}<Icon name="arrow" size={18}/></button>
            {message && <p className="auth-feedback" role="alert">{message}</p>}
          </form>
          <p className="auth-divider"><span>หรือ</span></p>
          <form action={loginWithGoogle}>
            <button type="submit" className="button button-outline auth-google" disabled={pending}>ดำเนินการต่อด้วย Google</button>
          </form>
          <p className="auth-switch">{register ? "มีบัญชีอยู่แล้ว?" : "ยังไม่มีบัญชี?"} <Link href={register ? "/login" : "/register"}>{register ? "เข้าสู่ระบบ" : "สมัครสมาชิก"}</Link></p>
        </section>
      </div>
    </div>
  );
}
