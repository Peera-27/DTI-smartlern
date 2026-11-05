import { expect, test } from "bun:test";
import { gradeQuiz } from "./grade";

const qs = [
  { id: "q1", options: [{ id: "a", isCorrect: true }, { id: "b", isCorrect: false }] },
  { id: "q2", options: [{ id: "c", isCorrect: false }, { id: "d", isCorrect: true }] },
  { id: "q3", options: [{ id: "e", isCorrect: true }, { id: "f", isCorrect: false }] },
];

test("ถูกหมด = 100", () => expect(gradeQuiz(qs, { q1: "a", q2: "d", q3: "e" })).toBe(100));
test("ถูก 2 ใน 3 ปัดเป็น 67", () => expect(gradeQuiz(qs, { q1: "a", q2: "d", q3: "f" })).toBe(67));
test("ไม่ตอบ = ผิด", () => expect(gradeQuiz(qs, {})).toBe(0));
test("ตอบด้วย id ตัวเลือกของข้ออื่นไม่นับ", () => expect(gradeQuiz(qs, { q1: "e" })).toBe(0));
test("ไม่มีคำถาม = 0", () => expect(gradeQuiz([], {})).toBe(0));
