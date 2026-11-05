import { describe, expect, test } from "bun:test";
import { createCourseSchema, extractYoutubeId, imageSrc, saveQuizSchema } from "./schemas";

const ID = "dQw4w9WgXcQ";

describe("extractYoutubeId", () => {
  test.each([
    ID,
    `https://www.youtube.com/watch?v=${ID}`,
    `https://www.youtube.com/watch?t=10&v=${ID}`,
    `https://youtu.be/${ID}?si=abc`,
    `https://www.youtube.com/shorts/${ID}`,
    `https://www.youtube.com/embed/${ID}`,
  ])("%s", (input) => expect(extractYoutubeId(input)).toBe(ID));

  test("ลิงก์ที่ไม่ใช่ YouTube", () => {
    expect(extractYoutubeId("https://vimeo.com/123")).toBeNull();
    expect(extractYoutubeId("short")).toBeNull();
  });
});

describe("imageSrc", () => {
  test("รับ https และ path ใน /public", () => {
    expect(imageSrc.safeParse("https://cdn.example.com/a.jpg").success).toBe(true);
    expect(imageSrc.safeParse("/media/safety.jpg").success).toBe(true);
  });
  test("ไม่รับ // (ลิงก์ไปเว็บอื่น) และ http", () => {
    expect(imageSrc.safeParse("//evil.com/a.jpg").success).toBe(false);
    expect(imageSrc.safeParse("http://example.com/a.jpg").success).toBe(false);
  });
});

describe("slug", () => {
  const base = { title: "t", summary: "s" };
  test("ตัดช่องว่างและทำเป็นตัวเล็ก", () => {
    expect(createCourseSchema.parse({ ...base, slug: " Intro-Python " }).slug).toBe("intro-python");
  });
  test.each(["ab", "intro_python", "-intro", "intro--python", "ไทย"])("ไม่รับ %s", (slug) => {
    expect(createCourseSchema.safeParse({ ...base, slug }).success).toBe(false);
  });
});

describe("saveQuizSchema", () => {
  const quiz = (correct: boolean[]) => ({
    lessonId: "cjld2cjxh0000qzrmn831i7rn",
    passingScore: 70,
    questions: [{ text: "q", options: correct.map((isCorrect, i) => ({ text: `o${i}`, isCorrect })) }],
  });
  test("คำตอบถูก 1 ข้อพอดี ผ่าน", () => expect(saveQuizSchema.safeParse(quiz([true, false])).success).toBe(true));
  test("ไม่มีคำตอบถูก ไม่ผ่าน", () => expect(saveQuizSchema.safeParse(quiz([false, false])).success).toBe(false));
  test("ถูก 2 ข้อ ไม่ผ่าน", () => expect(saveQuizSchema.safeParse(quiz([true, true])).success).toBe(false));
  test("ตัวเลือกเดียว ไม่ผ่าน", () => expect(saveQuizSchema.safeParse(quiz([true])).success).toBe(false));
});
