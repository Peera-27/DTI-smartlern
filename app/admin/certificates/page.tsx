import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { revokeCertificateForm } from "../actions";
import { ConfirmButton } from "../confirm-button";
import { Flash, PageHead, dateFmt, requireAdminPage } from "../shared";

export const metadata: Metadata = { title: "ใบประกาศ", robots: { index: false } };

async function Certificates({ searchParams }: PageProps<"/admin/certificates">) {
  await requireAdminPage();
  const { error, done } = await searchParams;
  // shortcut: แสดง 200 ใบล่าสุด, เพิ่มการแบ่งหน้า/ค้นหาเมื่อมีมากกว่านี้
  const [certs, total] = await Promise.all([
    prisma.certificate.findMany({
      orderBy: { issuedAt: "desc" },
      take: 200,
      select: {
        id: true,
        code: true,
        issuedAt: true,
        user: { select: { name: true, email: true } },
        course: { select: { id: true, title: true } },
      },
    }),
    prisma.certificate.count(),
  ]);

  return (
    <>
      <PageHead title="ใบประกาศ" sub={`ออกแล้ว ${total.toLocaleString("th-TH")} ใบ${total > certs.length ? ` · แสดง ${certs.length} ใบล่าสุด` : ""}`} />
      <Flash error={error} done={done} />

      <section className="panel" aria-labelledby="certs-title">
        <h2 id="certs-title" className="sr-only">
          รายการใบประกาศ
        </h2>
        {certs.length ? (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th scope="col">ผู้เรียน</th>
                  <th scope="col">หลักสูตร</th>
                  <th scope="col" className="num">
                    ออกเมื่อ
                  </th>
                  <th scope="col">
                    <span className="sr-only">จัดการ</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {certs.map((c) => (
                  <tr key={c.id}>
                    <td className="cell-main">
                      <span>{c.user.name ?? "-"}</span>
                      <small>{c.user.email}</small>
                    </td>
                    <td>
                      <Link href={`/admin/courses/${c.course.id}`} className="cell-link">
                        {c.course.title}
                      </Link>
                    </td>
                    <td className="num" data-label="ออกเมื่อ">{dateFmt.format(c.issuedAt)}</td>
                    <td className="cell-actions">
                      <Link href={`/certificates/${c.code}`} className="row-action">
                        ดูใบ
                      </Link>
                      <form action={revokeCertificateForm.bind(null, c.id)}>
                        <ConfirmButton
                          className="row-action row-action-danger"
                          message={`ยกเลิกใบประกาศของ ${c.user.email}? ความคืบหน้าในหลักสูตรนี้จะถูกล้าง ผู้เรียนต้องเรียนใหม่`}
                        >
                          ยกเลิก
                        </ConfirmButton>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="empty-line">ยังไม่มีใบประกาศ ใบจะออกให้อัตโนมัติเมื่อผู้เรียนเรียนจบทุกบท</p>
        )}
      </section>
    </>
  );
}

export default function CertificatesPage(props: PageProps<"/admin/certificates">) {
  return (
    <Suspense fallback={<p className="admin-loading">กำลังโหลด…</p>}>
      <Certificates {...props} />
    </Suspense>
  );
}
