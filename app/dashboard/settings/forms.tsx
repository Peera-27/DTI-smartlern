"use client";

import { startTransition, useActionState, useEffect, useRef, useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { changePassword, deleteAccount, updateProfile, type FormState } from "@/lib/profile/actions";
import { AvatarCropper } from "./avatar-cropper";
import { useConfirm } from "./confirm-dialog";

function Field({ name, label, state, hint, ...input }: { name: string; label: string; state: FormState; hint?: ReactNode } & React.ComponentProps<"input">) {
  const error = state?.fieldErrors?.[name]?.[0];
  return (
    <div className="field">
      <label htmlFor={`f-${name}`}>{label}</label>
      <input id={`f-${name}`} name={name} aria-invalid={!!error} aria-describedby={error ? `e-${name}` : undefined} {...input} />
      {error ? <small id={`e-${name}`} className="field-error">{error}</small> : hint && <small>{hint}</small>}
    </div>
  );
}

function Status({ state }: { state: FormState }) {
  if (!state?.message) return null;
  return <p role="status" className={state.ok ? "form-ok" : "form-error"}>{state.message}</p>;
}

type Profile = { name: string | null; email: string; image: string | null; phone: string | null; organization: string | null; position: string | null };

/**
 * ถามก่อนออกจากหน้าเมื่อมีข้อมูลยังไม่บันทึก
 * - กดลิงก์ในเว็บ: ป๊อปอัปของเว็บ (useConfirm)
 * - ปิดแท็บ/รีเฟรช: เบราว์เซอร์บังคับใช้กล่องของตัวเอง เปลี่ยนหน้าตาไม่ได้
 */
function useUnsavedGuard(dirty: boolean, ask: ReturnType<typeof useConfirm>[1]) {
  const router = useRouter();
  useEffect(() => {
    if (!dirty) return;
    const onUnload = (e: BeforeUnloadEvent) => e.preventDefault();
    const stop = () => {
      removeEventListener("beforeunload", onUnload);
      document.removeEventListener("click", onClick, true);
    };
    // capture phase ทำงานก่อน onClick ของ next/link และ Link จะไม่นำทางถ้า defaultPrevented
    function onClick(e: MouseEvent) {
      const a = (e.target as Element).closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a || a.getAttribute("href")?.startsWith("#") || a.hasAttribute("download") || a.target === "_blank") return;
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return; // เปิดแท็บใหม่ ไม่ได้ออกจากหน้านี้
      e.preventDefault();
      ask({ title: "ยังไม่ได้บันทึก", message: "มีข้อมูลที่แก้ไขแล้วแต่ยังไม่ได้บันทึก ถ้าออกจากหน้านี้การแก้ไขจะหายไป", confirmLabel: "ออกโดยไม่บันทึก", danger: true }).then((ok) => {
        if (!ok) return;
        stop();
        if (a.origin === location.origin) router.push(a.pathname + a.search + a.hash);
        else location.href = a.href;
      });
    }
    addEventListener("beforeunload", onUnload);
    document.addEventListener("click", onClick, true);
    return stop;
  }, [dirty, ask, router]);
}

// เทียบเฉพาะช่องข้อความ รูปเช็คแยกจาก state avatar
const snapshot = (form: HTMLFormElement) => JSON.stringify([...new FormData(form)].filter(([k]) => k !== "avatar"));

export function ProfileForm({ user, initials }: { user: Profile; initials: string }) {
  const form = useRef<HTMLFormElement>(null);
  const saved = useRef("");
  const [state, setState] = useState<FormState>(null);
  const [pending, start] = useTransition();
  const [fieldsDirty, setFieldsDirty] = useState(false);
  const [avatar, setAvatar] = useState<"keep" | "remove" | string>("keep");
  const [cropFile, setCropFile] = useState<File | null>(null);
  const [dialog, ask] = useConfirm();

  // ค่าที่บันทึกแล้ว ใช้เทียบว่ามีการแก้ไขหรือไม่ (พิมพ์แล้วลบกลับเป็นค่าเดิม = ไม่ถือว่าแก้)
  useEffect(() => { if (form.current) saved.current = snapshot(form.current); }, []);
  const check = () => {
    if (form.current) setFieldsDirty(snapshot(form.current) !== saved.current);
  };
  const dirty = fieldsDirty || avatar !== "keep";
  useUnsavedGuard(dirty, ask);

  const preview = avatar === "keep" ? user.image : avatar === "remove" ? null : avatar;

  return (
    <form
      ref={form}
      className="settings-form"
      onInput={check}
      onSubmit={(e) => {
        // ไม่ใช้ <form action> เพราะ React จะรีเซ็ตฟอร์มหลังส่ง ข้อมูลที่พิมพ์จะหายถ้าบันทึกไม่ผ่าน
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        start(async () => {
          const result = await updateProfile(null, data);
          setState(result);
          if (result?.ok && form.current) {
            setAvatar("keep");
            saved.current = snapshot(form.current);
            setFieldsDirty(false);
          }
        });
      }}
    >
      <input type="hidden" name="avatar" value={avatar} />
      <div className="avatar-form">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element -- data URL / รูป Google
          <img src={preview} alt="รูปโปรไฟล์" className="profile-avatar profile-avatar-lg" referrerPolicy="no-referrer" />
        ) : (
          <span className="profile-avatar profile-avatar-lg" aria-hidden="true">{initials}</span>
        )}
        <div className="settings-actions">
          <label className="button button-outline">
            เลือกรูปใหม่
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={(e) => {
                const file = e.currentTarget.files?.[0];
                e.currentTarget.value = "";
                if (!file) return;
                if (file.size > 10 * 1024 * 1024) return setState({ ok: false, message: "ไฟล์ใหญ่เกิน 10 MB" });
                setCropFile(file);
              }}
            />
          </label>
          {preview && <button type="button" className="text-link" onClick={() => setAvatar("remove")}>ลบรูป</button>}
          {avatar !== "keep" && <button type="button" className="text-link" onClick={() => setAvatar("keep")}>คืนรูปเดิม</button>}
        </div>
        <small className="settings-note">JPG, PNG หรือ WebP เลือกแล้วปรับตำแหน่งและซูมได้</small>
      </div>
      {dialog}
      {cropFile && <AvatarCropper file={cropFile} onCancel={() => setCropFile(null)} onDone={(url) => { setAvatar(url); setCropFile(null); }} />}

      <Field name="name" label="ชื่อ-นามสกุล" state={state} defaultValue={user.name ?? ""} required maxLength={100} autoComplete="name" />
      <Field name="email" label="อีเมล" state={state} defaultValue={user.email} disabled hint="ใช้เข้าสู่ระบบ เปลี่ยนไม่ได้" />
      <Field name="organization" label="หน่วยงาน / สังกัด" state={state} defaultValue={user.organization ?? ""} maxLength={150} autoComplete="organization" />
      <Field name="position" label="ตำแหน่ง" state={state} defaultValue={user.position ?? ""} maxLength={100} autoComplete="organization-title" />
      <Field name="phone" label="เบอร์โทรศัพท์" state={state} defaultValue={user.phone ?? ""} type="tel" maxLength={20} autoComplete="tel" />

      <div className="settings-actions settings-save">
        <button className="button button-primary" disabled={pending || !dirty}>{pending ? "กำลังบันทึก..." : "บันทึก"}</button>
        {dirty && !pending && <span className="settings-note">มีการแก้ไขที่ยังไม่บันทึก</span>}
        <Status state={state} />
      </div>
    </form>
  );
}

export function PasswordForm({ hasPassword }: { hasPassword: boolean }) {
  const [state, action, pending] = useActionState(changePassword, null);
  return (
    <form action={action} className="settings-form" key={state?.ok ? "done" : "edit"}>
      <Field name="password" label="รหัสผ่านใหม่" state={state} type="password" required minLength={8} maxLength={72} autoComplete="new-password" hint="อย่างน้อย 8 ตัวอักษร" />
      <Field name="confirm" label="ยืนยันรหัสผ่านใหม่" state={state} type="password" required autoComplete="new-password" />
      <div className="settings-actions settings-save">
        <button className="button button-primary" disabled={pending}>{pending ? "กำลังบันทึก..." : hasPassword ? "เปลี่ยนรหัสผ่าน" : "ตั้งรหัสผ่าน"}</button>
        <Status state={state} />
      </div>
    </form>
  );
}

export function DeleteForm({ email }: { email: string }) {
  const [state, action, pending] = useActionState(deleteAccount, null);
  const [dialog, ask] = useConfirm();
  return (
    <form
      className="settings-form"
      onSubmit={async (e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        const ok = await ask({ title: "ลบบัญชีถาวร?", message: "บัญชี ความคืบหน้า ผลสอบ และใบประกาศทั้งหมดจะถูกลบ กู้คืนไม่ได้", confirmLabel: "ลบบัญชีถาวร", danger: true });
        if (ok) startTransition(() => action(data));
      }}
    >
      {dialog}
      <Field name="confirmEmail" label={`พิมพ์อีเมล ${email} เพื่อยืนยัน`} state={state} required autoComplete="off" />
      <div className="settings-actions settings-save">
        <button className="button button-danger" disabled={pending}>{pending ? "กำลังลบ..." : "ลบบัญชีถาวร"}</button>
        <Status state={state} />
      </div>
    </form>
  );
}
