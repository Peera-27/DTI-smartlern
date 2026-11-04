import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

type Role = "ADMIN" | "LEARNER";

export default {
  providers: [
    Google({
      // Google ยืนยันอีเมลแล้ว จึงให้ผูกบัญชีกับอีเมลเดิมที่เคยสมัครด้วยรหัสผ่านได้
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  pages: { signIn: "/login" },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const user = auth?.user;
      const path = nextUrl.pathname;
      if (path.startsWith("/admin")) return user?.role === "ADMIN";
      if (path.startsWith("/dashboard") || path.startsWith("/learn")) return !!user;
      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user.role as Role | undefined) ?? "LEARNER";
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id as string;
      session.user.role = (token.role as Role | undefined) ?? "LEARNER";
      return session;
    },
  },
} satisfies NextAuthConfig;