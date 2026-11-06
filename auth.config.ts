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
      // ด่านนี้เช็คแค่ว่าล็อกอินแล้ว ไม่เช็ค role: role ใน JWT ตั้งตอนล็อกอินครั้งเดียว คนที่เพิ่งได้สิทธิ์แอดมินจะถูกเด้งจนกว่าจะล็อกอินใหม่
      // สิทธิ์แอดมินจริงเช็คจาก DB ทุกครั้งที่ requireAdminPage / requireAdmin (lib/admin/action.ts)
      if (path.startsWith("/admin") || path.startsWith("/dashboard") || path.startsWith("/learn")) return !!user;
      return true;
    },
    jwt({ token, user }) {
      // ไม่เก็บรูปใน token: รูปที่อัปโหลดเป็น data URL หลายสิบ KB จะทำให้ cookie ใหญ่จนเข้าสู่ระบบไม่ได้ (หน้าโปรไฟล์อ่านรูปจาก DB เอง)
      delete token.picture;
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