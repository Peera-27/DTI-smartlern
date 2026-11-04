"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/auth";

export async function loginWithCredentials(
  email: string,
  password: string,
): Promise<{ error: string } | undefined> {
  try {
    await signIn("credentials", { email, password, redirectTo: "/dashboard" });
  } catch (e) {
    if (e instanceof AuthError) return { error: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" };
    throw e; // ต้องโยนต่อ ไม่งั้น redirect หลังล็อกอินสำเร็จจะไม่ทำงาน
  }
}

export async function loginWithGoogle() {
  await signIn("google", { redirectTo: "/dashboard" });
}
