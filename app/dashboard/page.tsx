import { Suspense } from "react";
import { connection } from "next/server";
import { auth, signOut } from "@/auth";

async function UserInfo() {
  // auth() ใช้ crypto ตอนถอด session จึงต้องบอก Next ให้ render ตอน request ก่อน
  await connection();
  const session = await auth();

  return (
    <>
      <p>ชื่อ: {session?.user?.name}</p>
      <p>อีเมล: {session?.user?.email}</p>
      <p>บทบาท: {session?.user?.role}</p>
    </>
  );
}

export default function DashboardPage() {
  return (
    <main className="mx-auto max-w-md space-y-4 p-6">
      <h1 className="text-2xl font-bold">แดชบอร์ด</h1>

      <Suspense fallback={<p>กำลังโหลด...</p>}>
        <UserInfo />
      </Suspense>

      <form
        action={async () => {
          "use server";
          await signOut({ redirectTo: "/" });
        }}
      >
        <button className="rounded border px-3 py-2">ออกจากระบบ</button>
      </form>
    </main>
  );
}