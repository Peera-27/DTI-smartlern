import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import authConfig from "./auth.config";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

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

        const ok = await bcrypt.compare(parsed.data.password, user.passwordHash);
        return ok ? user : null;
      },
    }),
  ],
});