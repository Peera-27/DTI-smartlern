// ลองรหัสผ่านได้รอบละ 5 ครั้ง ครบรอบแล้วต้องรอ ยิ่งหลายรอบยิ่งรอนาน (รอบที่ 4 ขึ้นไปรอ 60 นาที)
export const ATTEMPTS_PER_ROUND = 5;
const LOCK_MINUTES = [1, 5, 15, 60];
// ไม่มีใครลองเลย 24 ชั่วโมง: ลืมประวัติ กลับไปเริ่มรอบแรก
export const FORGET_MS = 24 * 60 * 60_000;

export function lockMs(round: number) {
  return LOCK_MINUTES[Math.min(round, LOCK_MINUTES.length - 1)] * 60_000;
}

export function minutesLeft(round: number, lastAttemptAt: Date, now: Date) {
  return Math.max(1, Math.ceil((lastAttemptAt.getTime() + lockMs(round) - now.getTime()) / 60_000));
}
