import type { ReactNode } from "react";

// ตัวแสดงผล Tiptap JSON แบบเบา (server component) รองรับ node พื้นฐาน
// node ที่ไม่รู้จักจะแสดงแค่ลูกของมัน ไม่ใช้ dangerouslySetInnerHTML จึงไม่มีช่อง XSS

type Mark = { type: string; attrs?: Record<string, unknown> };
type Node = { type?: string; text?: string; marks?: Mark[]; attrs?: Record<string, unknown>; content?: Node[] };

function renderMarks(text: string, marks: Mark[] = []): ReactNode {
  return marks.reduce<ReactNode>((child, m) => {
    switch (m.type) {
      case "bold":
        return <strong>{child}</strong>;
      case "italic":
        return <em>{child}</em>;
      case "underline":
        return <u>{child}</u>;
      case "strike":
        return <s>{child}</s>;
      case "code":
        return <code>{child}</code>;
      case "link": {
        const href = typeof m.attrs?.href === "string" ? m.attrs.href : "";
        return /^https?:\/\//.test(href) ? (
          <a href={href} target="_blank" rel="noreferrer nofollow">
            {child}
          </a>
        ) : (
          child
        );
      }
      default:
        return child;
    }
  }, text);
}

function renderNode(node: Node, key: number): ReactNode {
  const kids = node.content?.map(renderNode);
  switch (node.type) {
    case "text":
      return <span key={key}>{renderMarks(node.text ?? "", node.marks)}</span>;
    case "paragraph":
      return <p key={key}>{kids}</p>;
    case "heading": {
      const level = Math.min(Math.max(Number(node.attrs?.level) || 2, 2), 4);
      const Tag = `h${level}` as "h2" | "h3" | "h4";
      return <Tag key={key}>{kids}</Tag>;
    }
    case "bulletList":
      return <ul key={key}>{kids}</ul>;
    case "orderedList":
      return <ol key={key}>{kids}</ol>;
    case "listItem":
      return <li key={key}>{kids}</li>;
    case "blockquote":
      return <blockquote key={key}>{kids}</blockquote>;
    case "codeBlock":
      return (
        <pre key={key}>
          <code>{kids}</code>
        </pre>
      );
    case "hardBreak":
      return <br key={key} />;
    case "horizontalRule":
      return <hr key={key} />;
    default:
      return kids ? <span key={key}>{kids}</span> : null;
  }
}

export function RichText({ doc, className }: { doc: unknown; className?: string }) {
  if (!doc || typeof doc !== "object") return null;
  const content = (doc as Node).content;
  if (!Array.isArray(content)) return null;
  return <div className={className}>{content.map(renderNode)}</div>;
}
