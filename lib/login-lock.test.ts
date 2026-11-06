import { expect, test } from "bun:test";
import { lockMs, minutesLeft } from "./login-lock";

test("ยิ่งหลายรอบยิ่งรอนาน และไม่เกิน 60 นาที", () => {
  expect([0, 1, 2, 3, 10].map((r) => lockMs(r) / 60_000)).toEqual([1, 5, 15, 60, 60]);
});

test("เวลาที่เหลือปัดขึ้น และอย่างน้อย 1 นาที", () => {
  const last = new Date("2026-01-01T00:00:00Z");
  expect(minutesLeft(2, last, new Date("2026-01-01T00:00:30Z"))).toBe(15);
  expect(minutesLeft(2, last, new Date("2026-01-01T00:14:01Z"))).toBe(1);
  expect(minutesLeft(0, last, new Date("2026-01-01T00:05:00Z"))).toBe(1);
});
