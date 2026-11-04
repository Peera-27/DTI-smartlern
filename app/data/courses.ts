export type Course = {
  id: number;
  title: string;
  category: string;
  duration: number;
  lessons: number;
  description: string;
  image: string;
  alt: string;
};

export const categories = ["ทั้งหมด", "ความปลอดภัย", "ทักษะดิจิทัล", "การสื่อสาร", "การบริหาร"];

// หลักสูตรตัวอย่าง: ยังไม่เปิดลงทะเบียนจริง
export const courses: Course[] = [
  { id: 1, title: "ความปลอดภัยในการทำงาน", category: "ความปลอดภัย", duration: 45, lessons: 4, description: "เรียนรู้การประเมินความเสี่ยง แนวปฏิบัติในการทำงานอย่างปลอดภัย และการเลือกใช้อุปกรณ์ป้องกันส่วนบุคคล", image: "/media/safety.jpg", alt: "คนงานสวมหมวกนิรภัยบนระเบียงอาคารที่กำลังก่อสร้าง" },
  { id: 2, title: "การใช้เครื่องมือดิจิทัล", category: "ทักษะดิจิทัล", duration: 60, lessons: 5, description: "จัดการเอกสาร ทำงานร่วมกันผ่านเครื่องมือออนไลน์ และเลือกใช้เครื่องมือดิจิทัลให้เหมาะกับงานประจำวัน", image: "/media/digital.webp", alt: "แป้นพิมพ์ของเครื่องพิมพ์ดีดรุ่นเก่า" },
  { id: 3, title: "ทักษะการสื่อสารในทีม", category: "การสื่อสาร", duration: 45, lessons: 4, description: "ฝึกการฟังอย่างเข้าใจ สื่อสารให้ชัดเจน และให้ความคิดเห็นอย่างสร้างสรรค์ เพื่อการทำงานร่วมกันที่ดีขึ้น", image: "/media/communication.jpg", alt: "หน้าปัดหมุนของโทรศัพท์รุ่นเก่า" },
  { id: 4, title: "การคุ้มครองข้อมูลส่วนบุคคล", category: "ความปลอดภัย", duration: 40, lessons: 4, description: "ทำความเข้าใจการดูแลข้อมูลส่วนบุคคล เรียนรู้จากสถานการณ์จำลอง และแนวทางจัดการข้อมูลภายในองค์กร", image: "/media/privacy.jpg", alt: "กุญแจคล้องพร้อมลูกกุญแจสองดอก" },
  { id: 5, title: "บริหารเวลาให้มีประสิทธิภาพ", category: "การบริหาร", duration: 30, lessons: 3, description: "จัดลำดับความสำคัญ วางแผนงาน และสร้างวิธีทำงานที่เหมาะกับเป้าหมายของคุณ", image: "/media/time.jpg", alt: "นาฬิกาปลุกรุ่นเก่าวางบนชั้นหนังสือ" },
  { id: 6, title: "การบริการลูกค้าอย่างเข้าใจ", category: "การสื่อสาร", duration: 45, lessons: 4, description: "เข้าใจความต้องการของลูกค้า ฝึกการสื่อสารเชิงบวก และรับมือกับสถานการณ์ที่ท้าทายผ่านตัวอย่าง", image: "/media/service.jpg", alt: "เคาน์เตอร์ประชาสัมพันธ์ในโรงพยาบาล" },
];

export const totalMinutes = courses.reduce((sum, c) => sum + c.duration, 0);
export const totalLessons = courses.reduce((sum, c) => sum + c.lessons, 0);

export function formatMinutes(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h ? `${h} ชั่วโมง${m ? ` ${m} นาที` : ""}` : `${m} นาที`;
}

export const photoCredits = [
  { title: "Construction worker CT", by: "HelenOnline", licence: "CC BY-SA 3.0", href: "https://commons.wikimedia.org/wiki/File:Construction_worker_CT.jpg" },
  { title: "Typewriter keyboard", by: "rawpixel", licence: "CC0", href: "https://www.rawpixel.com/image/5912075/image-public-domain-free-typewriter" },
  { title: "Rotary Dial Front", by: "Mark Fickett", licence: "CC BY 3.0", href: "https://commons.wikimedia.org/wiki/File:Rotary_Dial_Front.jpg" },
  { title: "Solex 99 30 padlock with keys", by: "Trougnouf", licence: "CC BY 4.0", href: "https://commons.wikimedia.org/w/index.php?curid=65582711" },
  { title: "Old alarm clock on the bookshelf", by: "Nenad Stojkovic", licence: "CC BY 2.0", href: "https://commons.wikimedia.org/wiki/File:Old_alarm_clock_on_the_bookshelf_-_50233824038.jpg" },
  { title: "Hunt and peck typing (วิดีโอ)", by: "C40115", licence: "CC BY 4.0", href: "https://commons.wikimedia.org/wiki/File:Hunt_and_peck_typing_%E2%80%94_Monkeytype_benchmark.webm" },
  { title: "Reception desk for Clinical Physiology, NÄL hospital", by: "W.carter", licence: "CC0", href: "https://commons.wikimedia.org/wiki/File:Reception_desk_for_Clinical_Physiology_-_N%C3%84L_hospital_1.jpg" },
];
