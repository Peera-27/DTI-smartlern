"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Ask = { title: string; message: string; confirmLabel: string; danger?: boolean };

/**
 * ป๊อปอัปยืนยันตามธีมเว็บ แทน confirm() ของเบราว์เซอร์
 * ใช้: const [dialog, ask] = useConfirm(); ... if (await ask({...})) ...; แล้ว render {dialog}
 */
export function useConfirm() {
  const [req, setReq] = useState<(Ask & { resolve: (ok: boolean) => void }) | null>(null);
  const ask = useCallback((a: Ask) => new Promise<boolean>((resolve) => setReq({ ...a, resolve })), []);
  const close = (ok: boolean) => {
    req?.resolve(ok);
    setReq(null);
  };
  return [req && <ConfirmDialog key={req.title + req.message} {...req} onClose={close} />, ask] as const;
}

function ConfirmDialog({ title, message, confirmLabel, danger, onClose }: Ask & { onClose: (ok: boolean) => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (!ref.current?.open) ref.current?.showModal();
  }, []);
  return (
    <dialog ref={ref} className="confirm-dialog" aria-labelledby="confirm-title" aria-describedby="confirm-message" onCancel={(e) => { e.preventDefault(); onClose(false); }}>
      <h2 id="confirm-title">{title}</h2>
      <p id="confirm-message">{message}</p>
      <div className="confirm-actions">
        {/* autoFocus ที่ปุ่มยกเลิก: กด Enter พลาดจะไม่ทำรายการที่ย้อนกลับไม่ได้ */}
        <button type="button" className="button button-outline" autoFocus onClick={() => onClose(false)}>ยกเลิก</button>
        <button type="button" className={`button ${danger ? "button-danger" : "button-primary"}`} onClick={() => onClose(true)}>{confirmLabel}</button>
      </div>
    </dialog>
  );
}
