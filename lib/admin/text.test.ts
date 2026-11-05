import { expect, test } from "bun:test";
import { docToText, textToDoc } from "./text";

test("textToDoc แยกย่อหน้าและขึ้นบรรทัด แล้วแปลงกลับได้เหมือนเดิม", () => {
  const text = "ย่อหน้าแรก\nบรรทัดสอง\n\nย่อหน้าที่สอง";
  const doc = textToDoc("  \r\n" + text.replace(/\n/g, "\r\n") + "\n\n\n");
  expect(doc?.content).toHaveLength(2);
  expect(docToText(doc)).toBe(text);
});

test("ข้อความว่างได้ null", () => {
  expect(textToDoc(" \n\n ")).toBeNull();
  expect(docToText(null)).toBe("");
});
