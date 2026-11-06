import { cacheTag } from "next/cache";
import { prisma } from "@/lib/prisma";
// cache tag ที่ใช้ร่วมกันระหว่างหน้า public กับ action ของแอดมิน
export const tags = {
  courses: "courses",
  course: (slug: string) => `course:${slug}`,
};

/** slug ของคอร์สที่เผยแพร่แล้วทั้งหมด (ใช้ใน generateStaticParams) */
export async function getPublishedCourseSlugs() {
  "use cache";
  cacheTag(tags.courses);
  const rows = await prisma.course.findMany({ where: { published: true }, select: { slug: true } });
  return rows.map((r) => r.slug);
}

/**
 * รายละเอียดคอร์สสำหรับหน้า public
 * select เฉพาะ field ที่แสดงได้: ไม่ส่งเนื้อหาบทเรียน, youtubeId หรือคำตอบข้อสอบออกไป
 */
export async function getPublishedCourse(slug: string) {
  "use cache";
  cacheTag(tags.courses, tags.course(slug));
  return prisma.course.findFirst({
    where: { slug, published: true },
    select: {
      slug: true,
      title: true,
      summary: true,
      description: true,
      coverImage: true,
      instructor: true,
      durationMin: true,
      updatedAt: true,
      lessons: {
        orderBy: { position: "asc" },
        select: { id: true, title: true, type: true, position: true },
      },
    },
  });
}
