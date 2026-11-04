"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useTransition, type FormEvent } from "react";
import { loginWithCredentials, loginWithGoogle } from "../login/actions";
import { courses } from "../data/courses";
import { LoopVideo, Reveal } from "./motion";
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
    <div className="wrap auth-page">
      <div className="auth-shell">
        <aside className="auth-intro" aria-label="เกี่ยวกับ SmartLern">
          <div className="auth-mosaic">
            <Reveal className="auth-cell"><LoopVideo src="/media/typing.webm" poster="/media/typing-poster.jpg" label="มือกำลังพิมพ์บนแป้นคีย์บอร์ดโน้ตบุ๊ก" /></Reveal>
            {[5, 3, 1].map((id, i) => {
              const c = courses.find((x) => x.id === id)!;
              return <Reveal key={id} className="auth-cell" d={i + 1}><Image src={c.image} alt={c.alt} fill priority sizes="(min-width: 900px) 21vw, 50vw" /></Reveal>;
            })}
          </div>
          <div className="auth-intro-text">
            <Reveal as="h2">หลักสูตรละไม่เกินหนึ่งชั่วโมง</Reveal>
            <Reveal as="p" d={1}>หกหลักสูตรของฝ่ายฝึกอบรม เรียนจบได้ในพักเที่ยง จากคอมพิวเตอร์ แท็บเล็ต หรือมือถือ</Reveal>
          </div>
        </aside>
        <section className="auth-panel" aria-labelledby="auth-title">
          <Reveal as="h1" id="auth-title">{register ? "สมัครสมาชิก" : "เข้าสู่ระบบ"}</Reveal>
          <p className="auth-description">{register ? "สร้างบัญชี SmartLern เพื่อเรียนหลักสูตรออนไลน์ของฝ่ายฝึกอบรม หลักสูตรละ 30–60 นาที" : "ยินดีต้อนรับกลับสู่ SmartLern ห้องเรียนออนไลน์ของฝ่ายฝึกอบรม เข้าสู่ระบบด้วยอีเมลหรือบัญชี Google"}</p>
          <form onSubmit={handleSubmit} onInput={() => setMessage("")} className="auth-form">
            {register && <Reveal className="form-field" d={2}><label htmlFor="full-name">ชื่อ–นามสกุล</label><input id="full-name" name="name" autoComplete="name" placeholder="ชื่อและนามสกุลของคุณ" required maxLength={100} onChange={(event) => event.currentTarget.setCustomValidity("")}/></Reveal>}
            <Reveal className="form-field" d={3}><label htmlFor="email">อีเมล</label><input id="email" name="email" type="email" autoComplete="email" placeholder="you@example.com" required maxLength={254}/></Reveal>
            <Reveal className="form-field" d={4}><label htmlFor="password">รหัสผ่าน</label><div className="password-field"><input id="password" name="password" type={showPassword ? "text" : "password"} autoComplete={register ? "new-password" : "current-password"} placeholder={register ? "ตั้งรหัสผ่านอย่างน้อย 8 ตัวอักษร" : "กรอกรหัสผ่านของคุณ"} required minLength={register ? 8 : undefined} maxLength={register ? 72 : undefined} aria-describedby={register ? "password-help" : undefined} onChange={(event) => { const confirm = event.currentTarget.form?.elements.namedItem("confirmPassword") as HTMLInputElement | null; confirm?.setCustomValidity(""); }}/><button type="button" aria-label={showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"} aria-pressed={showPassword} onClick={() => setShowPassword(!showPassword)}>{showPassword ? "ซ่อน" : "แสดง"}</button></div>{register && <small id="password-help">ใช้รหัสผ่านอย่างน้อย 8 ตัวอักษร</small>}</Reveal>
            {register && <Reveal className="form-field" d={5}><label htmlFor="confirm-password">ยืนยันรหัสผ่าน</label><input id="confirm-password" name="confirmPassword" type={showPassword ? "text" : "password"} autoComplete="new-password" placeholder="กรอกรหัสผ่านอีกครั้ง" required minLength={8} maxLength={72} onChange={(event) => event.currentTarget.setCustomValidity("")}/></Reveal>}
            <button type="submit" className="button button-primary auth-submit" disabled={pending}>{pending ? "กำลังดำเนินการ..." : register ? "สมัครสมาชิก" : "เข้าสู่ระบบ"}<Icon name="arrow" size={18}/></button>
            {message && <p className="auth-feedback" role="alert">{message}</p>}
          </form>
          <Reveal as="p" className="auth-divider" d={3}>หรือ</Reveal>
          <form action={loginWithGoogle}>
            <button type="submit" className="button button-outline auth-google" disabled={pending}>ดำเนินการต่อด้วย Google</button>
          </form>
          <Reveal as="p" className="auth-switch" d={4}>{register ? "มีบัญชีอยู่แล้ว?" : "ยังไม่มีบัญชี?"} <Link href={register ? "/login" : "/register"}>{register ? "เข้าสู่ระบบ" : "สมัครสมาชิก"}</Link></Reveal>
        </section>
      </div>
    </div>
  );
}
