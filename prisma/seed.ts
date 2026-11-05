// Seed ข้อมูลตัวอย่าง: แอดมิน 1 คน + คอร์ส 2 คอร์ส (บทเรียนข้อความ + แบบทดสอบท้ายคอร์ส)
// รัน: bunx prisma db seed
// รันซ้ำได้: คอร์สอ้างอิงด้วย slug และบทเรียนเดิมของคอร์สจะถูกลบแล้วสร้างใหม่ทุกครั้ง
// ไม่แตะข้อมูลผู้เรียน (enrollment / progress / attempt ของคอร์สอื่น)

import { PrismaClient, Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// ---------- helper: ข้อความธรรมดา -> Tiptap JSON ----------
function doc(...paragraphs: string[]): Prisma.InputJsonValue {
  return {
    type: "doc",
    content: paragraphs.map((text) => ({
      type: "paragraph",
      content: [{ type: "text", text }],
    })),
  };
}

type SeedQuestion = { text: string; options: string[]; correct: number; explanation?: string };

type SeedLesson =
  | { title: string; type: "TEXT"; content: string[] }
  | { title: string; type: "VIDEO"; youtubeId: string; content?: string[] }
  | { title: string; type: "QUIZ"; passingScore?: number; questions: SeedQuestion[] };

type SeedCourse = {
  slug: string;
  title: string;
  summary: string;
  description: string[];
  coverImage: string;
  instructor: string;
  durationMin: number;
  lessons: SeedLesson[];
};

// ---------- ข้อมูลคอร์ส ----------
// ชื่อและรูปตรงกับข้อมูลจำลองใน app/data/courses.ts เพื่อให้สลับหน้าแรกมาใช้ DB ได้โดยหน้าตาไม่เปลี่ยน
const courses: SeedCourse[] = [
  {
    slug: "workplace-safety",
    title: "ความปลอดภัยในการทำงาน",
    summary:
      "เรียนรู้การประเมินความเสี่ยง แนวปฏิบัติในการทำงานอย่างปลอดภัย และการเลือกใช้อุปกรณ์ป้องกันส่วนบุคคล",
    description: [
      "หลักสูตรพื้นฐานสำหรับบุคลากรทุกตำแหน่ง ครอบคลุมการระบุอันตราย การประเมินความเสี่ยง และการเลือกใช้อุปกรณ์ป้องกัน",
      "จบหลักสูตรด้วยแบบทดสอบ ผ่านเกณฑ์ 70% เพื่อรับใบประกาศ",
    ],
    coverImage: "/media/safety.jpg",
    instructor: "ฝ่ายฝึกอบรม",
    durationMin: 45,
    lessons: [
      {
        title: "อันตรายในที่ทำงานมีอะไรบ้าง",
        type: "TEXT",
        content: [
          "อันตรายในที่ทำงานแบ่งได้เป็นกลุ่มใหญ่ ได้แก่ อันตรายทางกายภาพ (เสียงดัง ความร้อน ที่สูง) อันตรายทางเคมี อันตรายทางชีวภาพ และอันตรายจากการยศาสตร์ เช่น ท่าทางการทำงานที่ไม่เหมาะสม",
          "ขั้นแรกของการทำงานอย่างปลอดภัยคือสังเกตและระบุอันตรายให้ได้ก่อนเริ่มงานทุกครั้ง",
        ],
      },
      {
        title: "การประเมินความเสี่ยง",
        type: "TEXT",
        content: [
          "ความเสี่ยง = โอกาสที่จะเกิด x ความรุนแรงหากเกิดขึ้น ใช้ตารางความเสี่ยง (risk matrix) จัดระดับเป็น ต่ำ ปานกลาง สูง",
          "เมื่อความเสี่ยงสูง ให้ควบคุมตามลำดับ: กำจัดอันตราย > ทดแทน > ควบคุมทางวิศวกรรม > ควบคุมทางการบริหาร > ใช้อุปกรณ์ป้องกันส่วนบุคคล",
        ],
      },
      {
        title: "อุปกรณ์ป้องกันส่วนบุคคล (PPE)",
        type: "TEXT",
        content: [
          "PPE เช่น หมวกนิรภัย แว่นตานิรภัย ถุงมือ รองเท้านิรภัย และที่ครอบหู ต้องเลือกให้ตรงกับอันตรายของงาน และตรวจสภาพก่อนใช้ทุกครั้ง",
          "PPE เป็นมาตรการสุดท้ายในลำดับการควบคุม ไม่ใช่สิ่งแรกที่ควรพึ่ง",
        ],
      },
      {
        title: "แบบทดสอบท้ายหลักสูตร",
        type: "QUIZ",
        passingScore: 70,
        questions: [
          {
            text: "ข้อใดคือขั้นแรกของการทำงานอย่างปลอดภัย",
            options: ["สวมอุปกรณ์ป้องกัน", "ระบุอันตรายของงาน", "รายงานหัวหน้า", "อ่านคู่มือเครื่องจักร"],
            correct: 1,
            explanation: "ต้องรู้ก่อนว่ามีอันตรายอะไร จึงจะเลือกวิธีควบคุมได้ถูก",
          },
          {
            text: "ความเสี่ยงคำนวณจากอะไร",
            options: ["โอกาสที่จะเกิด x ความรุนแรง", "จำนวนพนักงาน x ชั่วโมงทำงาน", "ราคาอุปกรณ์", "จำนวนอุบัติเหตุปีที่แล้ว"],
            correct: 0,
          },
          {
            text: "ในลำดับการควบคุมอันตราย ข้อใดควรทำเป็นอันดับแรก",
            options: ["ใช้ PPE", "ฝึกอบรมพนักงาน", "กำจัดอันตรายออกไป", "ติดป้ายเตือน"],
            correct: 2,
          },
          {
            text: "ข้อใดกล่าวถูกต้องเกี่ยวกับ PPE",
            options: [
              "ใช้แทนการควบคุมอื่นได้ทั้งหมด",
              "เป็นมาตรการสุดท้ายในลำดับการควบคุม",
              "ไม่จำเป็นต้องตรวจสภาพก่อนใช้",
              "ใช้แบบเดียวกันได้กับทุกงาน",
            ],
            correct: 1,
          },
        ],
      },
    ],
  },
  {
    slug: "personal-data-protection",
    title: "การคุ้มครองข้อมูลส่วนบุคคล",
    summary:
      "ทำความเข้าใจการดูแลข้อมูลส่วนบุคคล เรียนรู้จากสถานการณ์จำลอง และแนวทางจัดการข้อมูลภายในองค์กร",
    description: [
      "หลักสูตรสั้นเกี่ยวกับหลักการคุ้มครองข้อมูลส่วนบุคคลที่พนักงานควรรู้ในการทำงานประจำวัน",
    ],
    coverImage: "/media/privacy.jpg",
    instructor: "ฝ่ายฝึกอบรม",
    durationMin: 40,
    lessons: [
      {
        title: "ข้อมูลส่วนบุคคลคืออะไร",
        type: "TEXT",
        content: [
          "ข้อมูลส่วนบุคคลคือข้อมูลที่ทำให้ระบุตัวบุคคลได้ ไม่ว่าทางตรงหรือทางอ้อม เช่น ชื่อ เลขบัตรประชาชน เบอร์โทร อีเมล หรือที่อยู่",
        ],
      },
      {
        title: "หลักการเก็บและใช้ข้อมูล",
        type: "TEXT",
        content: [
          "เก็บเท่าที่จำเป็น ใช้ตามวัตถุประสงค์ที่แจ้งไว้ เก็บไว้เท่าที่จำเป็น และรักษาความปลอดภัยของข้อมูล",
          "หากต้องใช้ข้อมูลเพื่อวัตถุประสงค์ใหม่ ต้องมีฐานทางกฎหมายรองรับหรือขอความยินยอมใหม่",
        ],
      },
      {
        title: "แบบทดสอบท้ายหลักสูตร",
        type: "QUIZ",
        passingScore: 70,
        questions: [
          {
            text: "ข้อใดเป็นข้อมูลส่วนบุคคล",
            options: ["ราคาสินค้า", "อีเมลของพนักงาน", "ชื่อบริษัท", "สภาพอากาศวันนี้"],
            correct: 1,
          },
          {
            text: "หลักการเก็บข้อมูลที่ถูกต้องคือข้อใด",
            options: ["เก็บให้มากที่สุดเผื่อใช้", "เก็บเท่าที่จำเป็นตามวัตถุประสงค์", "เก็บตลอดไป", "ส่งต่อให้ใครก็ได้ในองค์กร"],
            correct: 1,
          },
          {
            text: "ถ้าต้องการใช้ข้อมูลเพื่อวัตถุประสงค์ใหม่ ควรทำอย่างไร",
            options: ["ใช้ได้เลย", "ลบข้อมูลทิ้ง", "ต้องมีฐานทางกฎหมายหรือขอความยินยอมใหม่", "แจ้งหัวหน้าก็พอ"],
            correct: 2,
          },
        ],
      },
    ],
  },
];

// ---------- แอดมิน ----------
// ตั้งค่าใน .env: SEED_ADMIN_EMAIL และ SEED_ADMIN_PASSWORD (อย่างน้อย 8 ตัว)
// ถ้าไม่ใส่รหัสผ่าน จะแค่ตั้ง role = ADMIN ให้อีเมลนั้น (ใช้กรณีล็อกอินด้วย Google)
async function seedAdmin() {
  const email = process.env.SEED_ADMIN_EMAIL?.toLowerCase();
  if (!email) {
    console.log("ข้ามการสร้างแอดมิน: ไม่ได้ตั้ง SEED_ADMIN_EMAIL");
    return;
  }
  const password = process.env.SEED_ADMIN_PASSWORD;
  if (password && password.length < 8) throw new Error("SEED_ADMIN_PASSWORD ต้องยาวอย่างน้อย 8 ตัวอักษร");
  const passwordHash = password ? await bcrypt.hash(password, 12) : undefined;

  await prisma.user.upsert({
    where: { email },
    // ไม่ใส่รหัสผ่าน = ลบรหัสผ่านเดิมทิ้ง กันกรณีมีคนสมัครดักอีเมลแอดมินไว้ก่อน
    update: { role: "ADMIN", passwordHash: passwordHash ?? null },
    create: { email, name: "ผู้ดูแลระบบ", role: "ADMIN", passwordHash },
  });
  console.log(`แอดมิน: ${email}`);
}

async function seedCourse(c: SeedCourse) {
  await prisma.$transaction(async (tx) => {
    const course = await tx.course.upsert({
      where: { slug: c.slug },
      update: {
        title: c.title,
        summary: c.summary,
        description: doc(...c.description),
        coverImage: c.coverImage,
        instructor: c.instructor,
        durationMin: c.durationMin,
        published: true,
      },
      create: {
        slug: c.slug,
        title: c.title,
        summary: c.summary,
        description: doc(...c.description),
        coverImage: c.coverImage,
        instructor: c.instructor,
        durationMin: c.durationMin,
        published: true,
      },
    });

    // ลบบทเรียนเดิม (quiz / question / option / progress ถูกลบตาม onDelete: Cascade)
    await tx.lesson.deleteMany({ where: { courseId: course.id } });

    for (const [i, l] of c.lessons.entries()) {
      const lesson = await tx.lesson.create({
        data: {
          courseId: course.id,
          title: l.title,
          position: i + 1,
          type: l.type,
          youtubeId: l.type === "VIDEO" ? l.youtubeId : null,
          content: l.type !== "QUIZ" && l.content ? doc(...l.content) : undefined,
        },
      });

      if (l.type === "QUIZ") {
        await tx.quiz.create({
          data: {
            lessonId: lesson.id,
            passingScore: l.passingScore ?? 70,
            questions: {
              create: l.questions.map((q, qi) => ({
                text: q.text,
                position: qi + 1,
                explanation: q.explanation,
                options: {
                  create: q.options.map((text, oi) => ({ text, isCorrect: oi === q.correct })),
                },
              })),
            },
          },
        });
      }
    }
    console.log(`คอร์ส: ${c.title} (${c.lessons.length} บท)`);
  });
}

async function main() {
  await seedAdmin();
  for (const c of courses) await seedCourse(c);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
