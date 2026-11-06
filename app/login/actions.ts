"use server";

import { AuthError } from "next-auth";
import { AccountLocked, auth, signIn, signOut } from "@/auth";

export async function loginWithCredentials(
  email: string,
  password: string,
): Promise<{ error: string } | undefined> {
  try {
    await signIn("credentials", { email, password, redirectTo: "/dashboard" });
  } catch (e) {
    if (e instanceof AccountLocked) return { error: `ลองรหัสผ่านผิดหลายครั้งเกินไป กรุณารอ ${e.minutes} นาทีแล้วลองใหม่` };
    if (e instanceof AuthError) return { error: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" };
    throw e; // ต้องโยนต่อ ไม่งั้น redirect หลังล็อกอินสำเร็จจะไม่ทำงาน
  }
}

export async function loginWithGoogle() {
  // ถ้ายังมี session ของผู้ใช้อื่นค้างอยู่ Auth.js จะพยายามผูกบัญชี Google เข้ากับผู้ใช้คนนั้น
  // และ error OAuthAccountNotLinked ถ้า Google นี้ผูกกับผู้ใช้อื่นไว้แล้ว จึงต้องออกจากระบบก่อน
  if (await auth()) await signOut({ redirect: false });
  await signIn("google", { redirectTo: "/dashboard" });
}
