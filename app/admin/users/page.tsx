import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { deleteUserForm, setUserRoleForm } from "../actions";
import { ConfirmButton } from "../confirm-button";
import { Flash, PageHead, StatusPill, dateFmt, requireAdminPage } from "../shared";

export const metadata: Metadata = { title: "จัดการผู้ใช้", robots: { index: false } };

async function Users({ searchParams }: PageProps<"/admin/users">) {
  const me = await requireAdminPage();
  const { error, done, q } = await searchParams;
  const query = typeof q === "string" ? q.trim() : "";
  const where = query
    ? { OR: [{ name: { contains: query, mode: "insensitive" as const } }, { email: { contains: query, mode: "insensitive" as const } }] }
    : undefined;

  // shortcut: แสดงสูงสุด 200 คน, เพิ่มการแบ่งหน้าเมื่อผู้ใช้เยอะกว่านี้
  const [users, total, admins] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 200,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        _count: { select: { enrollments: true, certificates: true } },
      },
    }),
    prisma.user.count({ where }),
    prisma.user.count({ where: { role: "ADMIN" } }),
  ]);

  return (
    <>
      <PageHead title="ผู้ใช้" sub={`${total.toLocaleString("th-TH")} บัญชี${query ? ` ที่ตรงกับ “${query}”` : ""} · แอดมิน ${admins} คน`} />
      <Flash error={error} done={done} />

      <section className="panel" aria-labelledby="users-title">
        <div className="panel-head">
          <h2 id="users-title" className="sr-only">
            รายชื่อผู้ใช้
          </h2>
          <form className="inline-form" role="search">
            <label htmlFor="q" className="sr-only">
              ค้นหาผู้ใช้
            </label>
            <input id="q" name="q" type="search" defaultValue={query} placeholder="ค้นหาชื่อหรืออีเมล" />
            <button className="button button-outline">ค้นหา</button>
            {query && (
              <Link href="/admin/users" className="row-action">
                ล้าง
              </Link>
            )}
          </form>
        </div>
        {users.length ? (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th scope="col">ผู้ใช้</th>
                  <th scope="col">บทบาท</th>
                  <th scope="col" className="num">
                    ลงทะเบียน
                  </th>
                  <th scope="col" className="num">
                    ใบประกาศ
                  </th>
                  <th scope="col" className="num">
                    สมัครเมื่อ
                  </th>
                  <th scope="col">
                    <span className="sr-only">จัดการ</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const self = u.id === me.id;
                  const nextRole = u.role === "ADMIN" ? "LEARNER" : "ADMIN";
                  return (
                    <tr key={u.id}>
                      <td className="cell-main">
                        <span>
                          {u.name ?? "-"}
                          {self && <span className="faint"> (คุณ)</span>}
                        </span>
                        <small>{u.email}</small>
                      </td>
                      <td>
                        <StatusPill live={u.role === "ADMIN"}>{u.role === "ADMIN" ? "แอดมิน" : "ผู้เรียน"}</StatusPill>
                      </td>
                      <td className="num" data-label="ลงทะเบียน">{u._count.enrollments}</td>
                      <td className="num" data-label="ใบประกาศ">{u._count.certificates}</td>
                      <td className="num" data-label="สมัครเมื่อ">{dateFmt.format(u.createdAt)}</td>
                      <td className="cell-actions">
                        {self ? (
                          <span className="faint">—</span>
                        ) : (
                          <>
                            <form action={setUserRoleForm.bind(null, u.id, nextRole)}>
                              <ConfirmButton
                                className="row-action"
                                message={`เปลี่ยน ${u.email} เป็น${nextRole === "ADMIN" ? "แอดมิน" : "ผู้เรียน"}?`}
                              >
                                {nextRole === "ADMIN" ? "ตั้งเป็นแอดมิน" : "ถอดสิทธิ์แอดมิน"}
                              </ConfirmButton>
                            </form>
                            <form action={deleteUserForm.bind(null, u.id)}>
                              <ConfirmButton
                                className="row-action row-action-danger"
                                message={`ลบบัญชี ${u.email}? ความคืบหน้าและใบประกาศทั้งหมดของคนนี้จะหายไปด้วย`}
                              >
                                ลบ
                              </ConfirmButton>
                            </form>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="empty-line">ไม่พบผู้ใช้{query && ` ที่ตรงกับ “${query}”`}</p>
        )}
      </section>
    </>
  );
}

export default function UsersPage(props: PageProps<"/admin/users">) {
  return (
    <Suspense fallback={<p className="admin-loading">กำลังโหลด…</p>}>
      <Users {...props} />
    </Suspense>
  );
}
