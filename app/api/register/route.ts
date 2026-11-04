import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(72),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "ข้อมูลไม่ถูกต้อง" }, { status: 400 });
  }

  const { name, password } = parsed.data;
  const email = parsed.data.email.toLowerCase();

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) {
    return NextResponse.json({ error: "อีเมลนี้ถูกใช้แล้ว" }, { status: 409 });
  }

  await prisma.user.create({
    data: { name, email, passwordHash: await bcrypt.hash(password, 12) },
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}