import type { IconName } from "../components/icons";

// ข้อมูลองค์กร: แก้ไฟล์นี้ไฟล์เดียว หน้าแรก header และ footer จะเปลี่ยนตาม
// shortcut: ข้อความ "[รอข้อมูล]" เป็นตัวยึดตำแหน่ง แทนด้วยข้อมูลจริงก่อนเปิดใช้งาน
export const org = {
  name: "สถาบันเทคโนโลยีป้องกันประเทศ (องค์การมหาชน)",
  nameEn: "Defence Technology Institute",
  unit: "ศูนย์ฝึกอบรม UTC",
  intro: "[รอข้อมูล] ย่อหน้าแนะนำศูนย์ฝึกอบรม ประวัติ และบทบาทขององค์กร ความยาวประมาณ 2–3 บรรทัด",
  address: "[รอข้อมูล] ที่อยู่สำนักงาน",
  phone: "[รอข้อมูล]",
  email: "[รอข้อมูล]",
  hours: "จันทร์–ศุกร์ 08:30–16:30 น. [รอข้อมูล]",
};

export const pillars: { id: string; title: string; label: string; icon: IconName; text: string }[] = [
  { id: "vision", title: "วิสัยทัศน์", label: "VISION", icon: "chart", text: "[รอข้อมูล] ข้อความวิสัยทัศน์ขององค์กร" },
  { id: "mission", title: "พันธกิจ", label: "MISSION", icon: "book", text: "[รอข้อมูล] ข้อความพันธกิจขององค์กร" },
  { id: "safety", title: "ความปลอดภัย", label: "SAFETY", icon: "shield", text: "[รอข้อมูล] นโยบายด้านความปลอดภัย" },
];

export const news: { title: string; date: string; excerpt: string; image: string; href?: string }[] = [
  { title: "[รอข้อมูล] หัวข้อข่าวหรือกิจกรรม", date: "2026-11-01", excerpt: "[รอข้อมูล] สรุปข่าวสั้น ๆ หนึ่งถึงสองบรรทัด", image: "/media/communication.jpg" },
  { title: "[รอข้อมูล] หัวข้อข่าวหรือกิจกรรม", date: "2026-10-15", excerpt: "[รอข้อมูล] สรุปข่าวสั้น ๆ หนึ่งถึงสองบรรทัด", image: "/media/service.jpg" },
  { title: "[รอข้อมูล] หัวข้อข่าวหรือกิจกรรม", date: "2026-10-01", excerpt: "[รอข้อมูล] สรุปข่าวสั้น ๆ หนึ่งถึงสองบรรทัด", image: "/media/time.jpg" },
];
