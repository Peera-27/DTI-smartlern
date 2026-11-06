"use client";

import { useEffect, useRef, useState } from "react";

const VIEW = 280; // ขนาดกรอบครอปบนจอ (px)
const OUT = 256; // ขนาดรูปที่บันทึก (px)

type Pos = { x: number; y: number };

/** dialog ให้ผู้ใช้ลากเลื่อนและซูมรูปเอง แล้วคืน JPEG data URL ขนาด 256x256 */
export function AvatarCropper({ file, onDone, onCancel }: { file: File; onDone: (dataUrl: string) => void; onCancel: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [error, setError] = useState("");
  const [zoom, setZoom] = useState(1);
  const [pos, setPos] = useState<Pos>({ x: 0, y: 0 });
  const drag = useRef<{ start: Pos; from: Pos } | null>(null);

  useEffect(() => {
    if (!dialog.current?.open) dialog.current?.showModal();
    let stale = false; // StrictMode รัน effect สองรอบ: event ของรอบเก่า (URL ถูก revoke แล้ว) ต้องไม่ไปตั้ง error
    const url = URL.createObjectURL(file);
    const el = new Image();
    el.onload = () => {
      if (stale) return;
      // เริ่มที่กึ่งกลางรูป
      const k = VIEW / Math.min(el.naturalWidth, el.naturalHeight);
      setPos({ x: (VIEW - el.naturalWidth * k) / 2, y: (VIEW - el.naturalHeight * k) / 2 });
      setImg(el);
    };
    el.onerror = () => !stale && setError("เปิดไฟล์รูปนี้ไม่ได้ ลองใช้ JPG หรือ PNG");
    el.src = url;
    const d = dialog.current;
    return () => {
      stale = true;
      d?.close(); // modal ที่ค้างในหน้าซ่อน (cacheComponents) จะทำให้หน้าอื่นกดไม่ได้
      URL.revokeObjectURL(url);
    };
  }, [file]);

  // scale = จำนวนพิกเซลบนจอต่อ 1 พิกเซลของรูป ตอน zoom=1 ด้านที่สั้นกว่าพอดีกรอบ
  const scale = img ? (VIEW / Math.min(img.naturalWidth, img.naturalHeight)) * zoom : 1;
  const w = img ? img.naturalWidth * scale : VIEW;
  const h = img ? img.naturalHeight * scale : VIEW;
  // ห้ามเลื่อนจนเห็นขอบว่างในกรอบ
  const clamp = (p: Pos): Pos => ({ x: Math.min(0, Math.max(VIEW - w, p.x)), y: Math.min(0, Math.max(VIEW - h, p.y)) });
  const at = clamp(pos);

  const setZoomKeepCenter = (z: number) => {
    // ซูมรอบจุดกึ่งกลางกรอบ ไม่ให้รูปกระโดด
    const k = z / zoom;
    // ไม่ clamp ตรงนี้เพราะ clamp ใช้ขนาดรูปของซูมเดิม ตอน render จะ clamp ด้วยขนาดใหม่ให้เอง
    setPos({ x: VIEW / 2 - (VIEW / 2 - at.x) * k, y: VIEW / 2 - (VIEW / 2 - at.y) * k });
    setZoom(z);
  };

  const save = () => {
    if (!img) return;
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = OUT;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#fff"; // PNG โปร่งใสจะไม่กลายเป็นพื้นดำตอนแปลงเป็น JPEG
    ctx.fillRect(0, 0, OUT, OUT);
    ctx.drawImage(img, -at.x / scale, -at.y / scale, VIEW / scale, VIEW / scale, 0, 0, OUT, OUT);
    onDone(canvas.toDataURL("image/jpeg", 0.85));
  };

  return (
    <dialog ref={dialog} className="cropper" aria-labelledby="cropper-title" onCancel={(e) => { e.preventDefault(); onCancel(); }}>
      <h2 id="cropper-title">ปรับรูปโปรไฟล์</h2>
      {error ? (
        <p className="form-error">{error}</p>
      ) : (
        <>
          <div
            className="cropper-view"
            style={{ width: VIEW, height: VIEW }}
            tabIndex={0}
            role="application"
            aria-label="ลากเพื่อเลื่อนรูป หรือใช้ปุ่มลูกศร"
            onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); drag.current = { start: { x: e.clientX, y: e.clientY }, from: at }; }}
            onPointerMove={(e) => { const d = drag.current; if (d) setPos(clamp({ x: d.from.x + e.clientX - d.start.x, y: d.from.y + e.clientY - d.start.y })); }}
            onPointerUp={() => { drag.current = null; }}
            onKeyDown={(e) => {
              const step = { ArrowLeft: [10, 0], ArrowRight: [-10, 0], ArrowUp: [0, 10], ArrowDown: [0, -10] }[e.key];
              if (step) { e.preventDefault(); setPos(clamp({ x: at.x + step[0], y: at.y + step[1] })); }
            }}
          >
            {img && (
              // eslint-disable-next-line @next/next/no-img-element -- blob URL จากไฟล์ในเครื่อง
              <img src={img.src} alt="" draggable={false} style={{ width: w, height: h, transform: `translate(${at.x}px, ${at.y}px)` }} />
            )}
          </div>
          <label className="cropper-zoom">
            <span>ซูม</span>
            <input type="range" min={1} max={4} step={0.01} value={zoom} onChange={(e) => setZoomKeepCenter(Number(e.currentTarget.value))} disabled={!img} />
          </label>
        </>
      )}
      <div className="settings-actions">
        <button type="button" className="button button-primary" onClick={save} disabled={!img}>ใช้รูปนี้</button>
        <button type="button" className="button button-outline" onClick={onCancel}>ยกเลิก</button>
      </div>
    </dialog>
  );
}
