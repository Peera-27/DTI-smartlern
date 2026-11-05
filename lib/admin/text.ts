// แปลงข้อความจาก textarea <-> Tiptap JSON (ย่อหน้าคั่นด้วยบรรทัดว่าง, ขึ้นบรรทัดใหม่ = hardBreak)
// shortcut: แก้ผ่าน textarea จะเหลือแค่ย่อหน้าธรรมดา (ตัวหนา/หัวข้อหาย), ติดตั้ง Tiptap editor เมื่อต้องจัดรูปแบบ

type Node = { type?: string; text?: string; content?: Node[] };

export function textToDoc(text: string) {
  const paragraphs = text
    .replace(/\r\n/g, "\n")
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
  if (!paragraphs.length) return null;
  return {
    type: "doc" as const,
    content: paragraphs.map((p) => ({
      type: "paragraph",
      content: p.split("\n").flatMap((line, i) => [...(i ? [{ type: "hardBreak" }] : []), { type: "text", text: line }]),
    })),
  };
}

const inline = (n: Node): string => (n.type === "hardBreak" ? "\n" : (n.text ?? "") + (n.content ?? []).map(inline).join(""));

export function docToText(doc: unknown): string {
  const blocks = (doc as Node | null)?.content;
  return Array.isArray(blocks) ? blocks.map(inline).join("\n\n") : "";
}
