"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";

export function HeaderDropdown({ label, children, avatar = false }: { label: ReactNode; children: ReactNode; avatar?: boolean }) {
  const [mode, setMode] = useState<"closed" | "hover" | "pinned">("closed");
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const id = useId();
  const open = mode !== "closed";
  function cancel() { if (timer.current) clearTimeout(timer.current); }
  useEffect(() => {
    if (!open) return;
    function outside(event: PointerEvent) { if (!root.current?.contains(event.target as Node)) setMode("closed"); }
    function escape(event: KeyboardEvent) { if (event.key === "Escape") { setMode("closed"); trigger.current?.focus(); } }
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    return () => { document.removeEventListener("pointerdown", outside); document.removeEventListener("keydown", escape); };
  }, [open]);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  return <div ref={root} className={`header-dropdown${open ? " is-open" : ""}${avatar ? " header-profile-dropdown" : ""}`}
    onPointerEnter={(event) => { if (event.pointerType === "mouse") { cancel(); setMode((previous) => previous === "pinned" ? previous : "hover"); } }}
    onPointerLeave={() => { cancel(); timer.current = setTimeout(() => setMode((previous) => previous === "hover" ? "closed" : previous), 50); }}
    onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setMode("closed"); }}>
    <button ref={trigger} type="button" className={avatar ? "header-avatar" : "nav-link"} aria-expanded={open} aria-controls={id}
      onClick={() => { cancel(); setMode((previous) => previous === "pinned" ? "closed" : "pinned"); }}>{label}</button>
    <div id={id} hidden={!open} className="header-dropdown-panel" onFocusCapture={() => { cancel(); setMode("pinned"); }} onClick={(event) => { if ((event.target as Element).closest("a")) setMode("closed"); }}>{children}</div>
  </div>;
}
