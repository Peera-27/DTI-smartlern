"use client";

import type { ComponentProps } from "react";

/** ปุ่ม submit ที่ถามยืนยันก่อน (ไว้ใช้กับปุ่มลบ) */
export function ConfirmButton({ message, ...props }: ComponentProps<"button"> & { message: string }) {
  return <button {...props} onClick={(e) => confirm(message) || e.preventDefault()} />;
}
