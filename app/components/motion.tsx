"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties, type ElementType, type ReactNode } from "react";

const reduced = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// ภาพใหญ่บน masthead เปลี่ยนช้าๆ ระหว่างภาพของแต่ละหลักสูตร
export function Crossfade({ images }: { images: { src: string; alt: string }[] }) {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (reduced()) return;
    const id = window.setInterval(() => {
      if (!document.hidden) setIndex((i) => (i + 1) % images.length);
    }, 5600);
    return () => window.clearInterval(id);
  }, [images.length]);
  return (
    <>
      {images.map((img, i) => (
        <Image key={img.src} src={img.src} alt={i === index ? img.alt : ""} aria-hidden={i !== index} fill priority={i === 0} sizes="(min-width: 900px) 50vw, 100vw" className={`fade-img${i === index ? " is-shown" : ""}`} />
      ))}
    </>
  );
}

// คลิปวนเงียบๆ ถ้าผู้ใช้ตั้งค่าลดการเคลื่อนไหว จะหยุดอยู่ที่ภาพ poster
export function LoopVideo({ src, poster, label }: { src: string; poster: string; label: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    if (!reduced()) ref.current?.play().catch(() => {});
  }, []);
  return <video ref={ref} className="loop-video" src={src} poster={poster} muted loop playsInline preload="metadata" aria-label={label} />;
}

// องค์ประกอบที่ค่อยๆ ขึ้นมาเมื่อเลื่อนถึง: React คุม class เองทั้งหมด จึงไม่ชนกับ hydration
// ก่อน JS ทำงาน หรือเมื่อผู้ใช้ตั้งค่าลดการเคลื่อนไหว เนื้อหาจะแสดงตามปกติ
export function Reveal({ as = "div", d = 0, className, style, children, ...rest }: { as?: ElementType; d?: number; className?: string; style?: CSSProperties; children?: ReactNode; id?: string; hidden?: boolean }) {
  const ref = useRef<HTMLElement>(null);
  const [state, setState] = useState<"" | "rv-wait" | "rv-in">("");
  useEffect(() => {
    const el = ref.current;
    if (!el || reduced()) return;
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setState("rv-in"); io.disconnect(); } else setState("rv-wait");
    }, { rootMargin: "0px 0px -6% 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const Tag = as;
  return <Tag {...rest} ref={ref} className={[className, state].filter(Boolean).join(" ") || undefined} style={{ ...style, "--d": d } as CSSProperties}>{children}</Tag>;
}
