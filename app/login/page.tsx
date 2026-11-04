import { Suspense } from "react";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { signIn } from "@/auth";

async function ErrorBanner({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  if (!error) return null;

  return (
    <p className="rounded border border-red-400 p-2 text-sm text-red-500">
      อีเมลหรือรหัสผ่านไม่ถูกต้อง
    </p>
  );
}

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  return (
    <main className="mx-auto max-w-sm space-y-4 p-6">
      <h1 className="text-2xl font-bold">เข้าสู่ระบบ</h1>

      <Suspense fallback={null}>
        <ErrorBanner searchParams={searchParams} />
      </Suspense>

      <form
        action={async () => {
          "use server";
          await signIn("google", { redirectTo: "/dashboard" });
        }}
      >
        <button className="w-full rounded border p-2">เข้าสู่ระบบด้วย Google</button>
      </form>

      <form
        className="space-y-2"
        action={async (formData: FormData) => {
          "use server";
          try {
            await signIn("credentials", {
              email: formData.get("email"),
              password: formData.get("password"),
              redirectTo: "/dashboard",
            });
          } catch (e) {
            if (e instanceof AuthError) redirect("/login?error=credentials");
            throw e; // ต้องโยนต่อ ไม่งั้น redirect หลังล็อกอินสำเร็จจะไม่ทำงาน
          }
        }}
      >
        <input name="email" type="email" placeholder="อีเมล" className="w-full rounded border p-2" required />
        <input name="password" type="password" placeholder="รหัสผ่าน" className="w-full rounded border p-2" required />
        <button className="w-full rounded border p-2">เข้าสู่ระบบด้วยอีเมล</button>
      </form>
    </main>
  );
}