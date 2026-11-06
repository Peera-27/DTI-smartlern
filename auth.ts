import NextAuth, { CredentialsSignin } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ATTEMPTS_PER_ROUND, FORGET_MS, lockMs, minutesLeft } from "@/lib/login-lock";
import authConfig from "./auth.config";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export class AccountLocked extends CredentialsSignin {
  code = "locked";
  constructor(public minutes: number) {
    super();
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  events: {
    // ผูก Google ครั้งแรกกับบัญชีที่ยังไม่ยืนยันอีเมล: ลบรหัสผ่านทิ้ง เพราะอาจเป็นคนอื่นสมัครดักอีเมลนี้ไว้
    async linkAccount({ user }) {
      if ("emailVerified" in user && user.emailVerified) return;
      await prisma.user.update({ where: { id: user.id }, data: { passwordHash: null, emailVerified: new Date() } });
    },
  },
  providers: [
    ...authConfig.providers,
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(raw) {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email.toLowerCase() },
        });
        if (!user?.passwordHash) return null;

        const now = new Date();
        const ago = (ms: number) => new Date(now.getTime() - ms);
        await prisma.user.updateMany({
          where: { id: user.id, lastLoginAttemptAt: { lt: ago(FORGET_MS) } },
          data: { loginAttempts: 0, loginLockRound: 0 },
        });
        // รอบนี้ครบแล้วและรอพอแล้ว: เปิดรอบถัดไป (เช็ค round เดิมใน where กันคำขอพร้อมกันเปิดซ้ำ)
        await prisma.user.updateMany({
          where: {
            id: user.id,
            loginAttempts: { gte: ATTEMPTS_PER_ROUND },
            loginLockRound: user.loginLockRound,
            lastLoginAttemptAt: { lt: ago(lockMs(user.loginLockRound)) },
          },
          data: { loginAttempts: 0, loginLockRound: { increment: 1 } },
        });
        // จองสิทธิ์ลองแบบ atomic ก่อนตรวจรหัส เพื่อให้ยิงพร้อมกันหลายคำขอก็ได้ไม่เกินรอบละ 5 ครั้ง
        const reserved = await prisma.user.updateMany({
          where: { id: user.id, loginAttempts: { lt: ATTEMPTS_PER_ROUND } },
          data: { loginAttempts: { increment: 1 }, lastLoginAttemptAt: now },
        });
        if (reserved.count === 0) {
          const fresh = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });
          throw new AccountLocked(minutesLeft(fresh.loginLockRound, fresh.lastLoginAttemptAt ?? now, now));
        }

        const ok = await bcrypt.compare(parsed.data.password, user.passwordHash);
        if (!ok) return null;
        await prisma.user.update({ where: { id: user.id }, data: { loginAttempts: 0, loginLockRound: 0 } });
        return user;
      },
    }),
  ],
});