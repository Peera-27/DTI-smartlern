# SmartLern

เว็บเรียนรู้ออนไลน์สำหรับบุคลากรในองค์กร พัฒนาด้วย Next.js และ TypeScript ปัจจุบันเป็นต้นแบบส่วนติดต่อผู้ใช้ ใช้ข้อมูลหลักสูตรจำลอง และยังไม่เชื่อมระบบบัญชีผู้ใช้หรือฐานข้อมูลกับหน้าเว็บ

## สิ่งที่ทำแล้ว

- Layout กลาง: navbar, footer, ลิงก์ข้ามไปเนื้อหา และเมนูเปิด–ปิดบนมือถือ
- หน้าแรก: แบนเนอร์ หมวดหมู่ตามความสนใจ หลักสูตรแนะนำ และข่าวประกาศตัวอย่าง
- หลักสูตรจำลอง 6 รายการ พร้อมค้นหา กรองหมวดหมู่ เรียงตามระยะเวลา และเปิดรายละเอียดในการ์ด
- ช่องค้นหาใน navbar ส่งคำค้นไปยังหน้าแรก รองรับ `/?q=คำค้น#courses` และ `/?category=ชื่อหมวดหมู่#courses`
- หน้าเข้าสู่ระบบและสมัครสมาชิก พร้อมปุ่มแสดง–ซ่อนรหัสผ่าน
- ตรวจช่องที่จำเป็น รูปแบบอีเมล ชื่อที่ไม่เป็นช่องว่าง รหัสผ่านสมัครสมาชิกอย่างน้อย 8 ตัวอักษร และรหัสผ่านยืนยันตรงกัน
- รองรับหน้าจอหลายขนาด: การ์ด 1 คอลัมน์เมื่อกว้างน้อยกว่า 600px, 2 คอลัมน์ตั้งแต่ 600px และ 3 คอลัมน์ตั้งแต่ 1100px
- ใช้ Prompt สำหรับหัวข้อ และ IBM Plex Sans Thai Looped สำหรับเนื้อหา ผ่าน `next/font/google`

## เส้นทางหน้าเว็บ

| URL | รายละเอียด |
| --- | --- |
| `/` | หน้าแรกและรายการหลักสูตรจำลอง |
| `/login` | ตัวอย่างฟอร์มเข้าสู่ระบบ |
| `/register` | ตัวอย่างฟอร์มสมัครสมาชิก |

**สถานะ Auth:** การส่งฟอร์มตรวจเฉพาะรูปแบบข้อมูลในเบราว์เซอร์ แล้วแสดงข้อความแจ้งว่าเป็นตัวอย่าง ไม่สร้างบัญชี ไม่ตรวจสอบรหัสผ่านกับเซิร์ฟเวอร์ ไม่สร้าง session และไม่บันทึกข้อมูลฟอร์ม

## เทคโนโลยี

- Next.js 16.4.4 (App Router), React 19.3.0 และ TypeScript 5
- Tailwind CSS 4 และ CSS กลางใน `app/globals.css`
- Prisma 6: มี schema เตรียมไว้สำหรับ PostgreSQL แต่หน้าเว็บปัจจุบันยังใช้ข้อมูลจำลอง
- Bun 1.3.9 เป็น package manager ที่ใช้ตรวจสอบงานชุดนี้

## เตรียมเครื่อง

ติดตั้ง Node.js ตั้งแต่ 20.9.0 ขึ้นไป ตามข้อกำหนด `engines` ของ Next.js ที่ติดตั้ง และ Bun เวอร์ชันเดียวกับค่า `packageManager` ใน `package.json` แล้วตรวจว่าคำสั่งใช้งานได้:

```powershell
node -v
bun --version
```

หากใช้ fnm ให้เปิดใช้งาน Node.js ผ่าน fnm ใน terminal ก่อนรันโปรเจกต์

## ติดตั้งและเริ่มพัฒนา

สร้างไฟล์ `.env` ที่โฟลเดอร์เดียวกับ `package.json` หากต้องใช้ Prisma โดยกำหนดค่าฐานข้อมูลของตัวเอง:

ค่าข้างต้นเป็นตัวอย่าง ต้องแทนที่ก่อนใช้ฐานข้อมูลจริง หน้า UI ปัจจุบันไม่ได้เรียกฐานข้อมูล จึงทดลองหน้าเว็บได้โดยยังไม่เชื่อม PostgreSQL ไฟล์ `.env` ถูก ignore โดย Git แล้ว ไม่ควรนำค่าจริงขึ้น repository

เริ่ม development server:

```powershell
bun run dev
```

เปิด URL ที่ terminal แสดง โดยปกติคือ [http://localhost:3000](http://localhost:3000) หากพอร์ตไม่ว่าง Next.js อาจเลือกพอร์ตอื่น หากมี dev server ของโปรเจกต์เปิดอยู่แล้ว ให้ใช้ตัวเดิมหรือหยุดด้วย Ctrl+C ใน terminal ที่เปิดไว้

ฟอนต์ Google ถูกดาวน์โหลดระหว่างการ compile/build ครั้งแรก จึงต้องเข้าถึงบริการฟอนต์ได้ จากนั้น Next.js ให้บริการไฟล์ฟอนต์จากแอปเอง

## คำสั่งที่ใช้

| คำสั่ง | หน้าที่ |
| --- | --- |
| `bun run dev` | เปิดเซิร์ฟเวอร์สำหรับพัฒนา |
| `bun run lint` | ตรวจโค้ดด้วย ESLint |
| `bun run typecheck` | ตรวจชนิดข้อมูล TypeScript |
| `bun run build` | สร้าง production build |
| `bun run start` | เปิด production server หลัง build สำเร็จ |

## การจัดการ dependencies และ bun.lock

ใช้ Bun เป็นหลักในการติดตั้ง dependencies เพื่อให้ทุกคนอ้างอิง `bun.lock` เดียวกัน

- หลัง clone หรือ pull ใช้ `bun install --frozen-lockfile` เพื่อป้องกัน lockfile เปลี่ยนโดยไม่ตั้งใจ
- เมื่อเพิ่มแพ็กเกจ ใช้ `bun add ชื่อแพ็กเกจ` หรือ `bun add -d ชื่อแพ็กเกจ` สำหรับเครื่องมือพัฒนา
- Commit `package.json` และ `bun.lock` ร่วมกันเมื่อเปลี่ยน dependencies ไม่แก้รายการแพ็กเกจใน lockfile ด้วยมือ
- การเพิ่ม Prisma ใน `bun.lock` เป็นการทำให้ตรงกับ dependencies ที่ประกาศใน `package.json`
- มี `package-lock.json` เดิมอยู่ใน repository ด้วย งานชุดนี้คงไฟล์ไว้ แต่ไม่ควรสลับ `npm install` กับ `bun install` โดยไม่ตกลงกับทีม เพราะ lockfile ทั้งสองชุดอาจต่างกัน
- ใช้ `trustedDependencies` สำหรับ `sharp` และ `unrs-resolver` ตามการตั้งค่าโปรเจกต์

เอกสารอ้างอิง: [Bun lockfile](https://bun.com/docs/pm/lockfile) และ [dependency lifecycle scripts](https://bun.com/docs/pm/lifecycle)

## โครงสร้างไฟล์หลัก

```text
app/
  layout.tsx                  # Layout, metadata, ฟอนต์ และ footer
  page.tsx                    # หน้าแรก แบนเนอร์ และข่าวประกาศ
  globals.css                 # สีธีมและ responsive styles
  components/
    site-header.tsx           # Navbar, ช่องค้นหา และเมนูมือถือ
    course-catalog.tsx        # ข้อมูลจำลองและตัวกรองหลักสูตร
    auth-form.tsx             # ฟอร์ม Login/Register ที่ใช้ร่วมกัน
    icons.tsx                 # ไอคอน SVG
  login/page.tsx              # หน้าเข้าสู่ระบบ
  register/page.tsx           # หน้าสมัครสมาชิก
prisma/
  schema.prisma               # โครงสร้างข้อมูลที่เตรียมไว้
```

## สีและฟอนต์

สีธีมกำหนดเป็น CSS variables ใน `app/globals.css`

| สี | การใช้งาน |
| --- | --- |
| `#0C8EF4` | สีหลักและจุดเน้น |
| `#85D5F6` | สีรองและองค์ประกอบตกแต่ง |
| `#F5FAFF` | พื้นหลังเว็บ |
| `#FFFFFF` | พื้นผิว navbar, footer และฟอร์ม |
| `#EAF6FE` | พื้นหลังแบนเนอร์และพื้นที่เน้น |
| `#16324F` | ข้อความหลัก |
| `#64748B` | ข้อความรอง |
| `#DCEBF5` | เส้นขอบ |
| `#0876CE` | ปุ่มหลักและข้อความเน้น |

ฟอนต์: [Prompt](https://fonts.google.com/specimen/Prompt) และ [IBM Plex Sans Thai Looped](https://fonts.google.com/specimen/IBM+Plex+Sans+Thai+Looped)

## งานที่ยังเหลือ

- เชื่อม Auth และ API สำหรับสมัครสมาชิก/เข้าสู่ระบบ พร้อมตรวจข้อมูลฝั่งเซิร์ฟเวอร์
- เชื่อมหลักสูตรและผู้ใช้กับฐานข้อมูล พร้อมจัดการ migration ตามสภาพแวดล้อมของทีม
- หน้ารายละเอียดหลักสูตร ห้องเรียน แบบทดสอบ และผลการเรียน
- ข้อมูลข่าวประกาศและช่องทางติดต่อจริง
- ทดสอบการโต้ตอบและหน้าตาบนคอม แท็บเล็ต และมือถือจริง รวมถึง production build ก่อนนำขึ้นใช้งาน

## การทำงานร่วมกันด้วย Git

แต่ละคนสร้าง branch จาก `main` ล่าสุด และรวมงานผ่าน Pull Request ตรวจให้ working tree พร้อมก่อนสลับ branch:

```powershell
git switch main
git pull --ff-only origin main
git switch -c feat/ชื่อฟีเจอร์
```

เมื่อทำงานเสร็จ ให้เลือก stage เฉพาะไฟล์ที่เกี่ยวข้อง ตรวจ `git diff --cached` แล้ว commit/push branch ของตัวเอง เปิด Pull Request ไปยัง `main` ให้ทีมรีวิว หากต้องแก้ `layout.tsx`, `globals.css` หรือไฟล์ส่วนกลางร่วมกัน ให้ตกลงขอบเขตกับเพื่อนก่อน
