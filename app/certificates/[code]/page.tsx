import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PrintButton } from "@/app/components/print-button";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "ใบประกาศนียบัตร", robots: { index: false } };

// หน้านี้เป็นทั้งใบประกาศ (สั่งพิมพ์จากเบราว์เซอร์ได้) และหน้าตรวจสอบ: ใครมีลิงก์ก็เปิดดูได้
async function Certificate({ params }: Pick<PageProps<"/certificates/[code]">, "params">) {
  const { code } = await params;
  const cert = await prisma.certificate.findUnique({
    where: { code },
    select: { code: true, issuedAt: true, user: { select: { name: true } }, course: { select: { title: true } } },
  });
  if (!cert) notFound();

  const date = cert.issuedAt.toLocaleDateString("th-TH", { dateStyle: "long", timeZone: "Asia/Bangkok" });
  return (
    <div className="wrap certificate-page">
      <section className="certificate" aria-labelledby="certificate-title">
        <p className="certificate-org">SmartLern · ฝ่ายฝึกอบรม</p>
        <h1 id="certificate-title">ใบประกาศนียบัตร</h1>
        <p>มอบให้ไว้เพื่อแสดงว่า</p>
        <p className="certificate-name">{cert.user.name ?? "ผู้เรียน"}</p>
        <p>ได้ผ่านการอบรมหลักสูตร</p>
        <p className="certificate-course">{cert.course.title}</p>
        <p>ให้ไว้ ณ วันที่ {date}</p>
        <p className="certificate-code">รหัสตรวจสอบ {cert.code}</p>
      </section>
      <PrintButton />
    </div>
  );
}

export default function CertificatePage(props: PageProps<"/certificates/[code]">) {
  return (
    <Suspense fallback={<div className="wrap py-10">กำลังโหลด...</div>}>
      <Certificate params={props.params} />
    </Suspense>
  );
}
