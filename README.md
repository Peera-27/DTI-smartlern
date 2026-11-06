# SmartLern

เว็บเรียนรู้ออนไลน์สำหรับบุคลากรในองค์กร พัฒนาด้วย Next.js และ TypeScript เชื่อมฐานข้อมูล PostgreSQL ผ่าน Prisma มีระบบบัญชีผู้ใช้ ห้องเรียน แบบทดสอบ ใบประกาศ และหลังบ้านสำหรับแอดมิน

## สิ่งที่ทำแล้ว

- **บัญชีผู้ใช้:** สมัครด้วยอีเมลและรหัสผ่าน หรือเข้าสู่ระบบด้วย Google (Auth.js) ลองรหัสผ่านได้รอบละ 5 ครั้ง ครบรอบต้องรอ 1, 5, 15 แล้ว 60 นาที (ตั้งค่าใน `lib/login-lock.ts`)
- **ผู้เรียน:** ลงทะเบียนเรียน เรียนบทเรียนแบบข้อความ วิดีโอ YouTube และ PDF เก็บความคืบหน้า ทำแบบทดสอบที่ตรวจคะแนนฝั่งเซิร์ฟเวอร์ และรับใบประกาศที่ตรวจสอบได้ด้วยรหัส
- **โปรไฟล์:** แก้ข้อมูลส่วนตัว เปลี่ยนรูปพร้อมครอปภาพ เปลี่ยนรหัสผ่าน ดาวน์โหลดข้อมูลของตัวเอง และลบบัญชี
- **แอดมิน:** สร้าง แก้ไข เปิด–ปิดการเผยแพร่หลักสูตร จัดการบทเรียนและแบบทดสอบ ตั้งสิทธิ์และลบผู้ใช้ ลงทะเบียนผู้เรียนด้วยอีเมล และดูใบประกาศที่ออกแล้ว
- **หน้าเว็บ:** หน้าแรกมีแบนเนอร์ หมวดหมู่ หลักสูตรแนะนำพร้อมค้นหา กรอง และเรียงลำดับ ข่าวประกาศ และหน้านโยบายความเป็นส่วนตัว รองรับมือถือ แท็บเล็ต และคอมพิวเตอร์

## เส้นทางหน้าเว็บ

| URL | รายละเอียด | ต้องล็อกอิน |
| --- | --- | --- |
| `/` | หน้าแรกและรายการหลักสูตร | |
| `/courses/[slug]` | รายละเอียดหลักสูตร | |
| `/certificates/[code]` | ตรวจสอบใบประกาศ | |
| `/login`, `/register` | เข้าสู่ระบบ / สมัครสมาชิก | |
| `/privacy` | นโยบายความเป็นส่วนตัว | |
| `/dashboard` | หลักสูตรของฉันและความคืบหน้า | ✓ |
| `/dashboard/settings` | ตั้งค่าโปรไฟล์และบัญชี | ✓ |
| `/learn/[slug]` | ห้องเรียน | ✓ |
| `/admin` | หลังบ้าน: หลักสูตร บทเรียน ผู้ใช้ ใบประกาศ | ✓ แอดมิน |

`proxy.ts` กันหน้า `/admin`, `/dashboard`, `/learn` ไว้ให้เฉพาะคนที่ล็อกอินแล้ว ส่วนสิทธิ์แอดมินเช็คจากฐานข้อมูลทุกครั้งใน `lib/admin/action.ts`

## เทคโนโลยี

- Next.js 16.4.4 (App Router), React 19.3.0 และ TypeScript 5
- Auth.js (next-auth v5) แบบ JWT session พร้อม Prisma adapter
- Prisma 6 กับ PostgreSQL (ใช้ Neon)
- Zod ตรวจข้อมูลฝั่งเซิร์ฟเวอร์ และ bcryptjs เข้ารหัสรหัสผ่าน
- Tailwind CSS 4 และ CSS กลางใน `app/globals.css`
- Bun 1.3.9 เป็น package manager และใช้ `bun test` รัน test

## เตรียมเครื่อง

ติดตั้ง Node.js ตั้งแต่ 20.9.0 ขึ้นไป และ Bun เวอร์ชันเดียวกับค่า `packageManager` ใน `package.json` แล้วตรวจว่าคำสั่งใช้งานได้:

```powershell
node -v
bun --version
```

## ติดตั้งและเริ่มพัฒนา

1. ติดตั้ง dependencies: `bun install --frozen-lockfile`
2. สร้างไฟล์ `.env` ที่โฟลเดอร์เดียวกับ `package.json` (ไฟล์นี้ถูก ignore โดย Git ห้ามนำค่าจริงขึ้น repository):

   ```env
   DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"
   AUTH_SECRET="สร้างด้วย bunx auth secret"
   AUTH_URL="http://localhost:3000"
   AUTH_GOOGLE_ID="..."
   AUTH_GOOGLE_SECRET="..."
   # ใช้ตอน seed เท่านั้น: สร้างหรือตั้งบัญชีนี้เป็นแอดมิน
   SEED_ADMIN_EMAIL="admin@example.com"
   SEED_ADMIN_PASSWORD="อย่างน้อย 8 ตัวอักษร"
   ```

   Google OAuth ต้องตั้ง redirect URI เป็น `{AUTH_URL}/api/auth/callback/google`

3. สร้างตารางในฐานข้อมูล: `bunx prisma db push` (ต้องรันใหม่ทุกครั้งที่แก้ `prisma/schema.prisma`)
4. ใส่ข้อมูลตัวอย่าง (แอดมิน 1 คน และหลักสูตร 2 หลักสูตร รันซ้ำได้): `bunx prisma db seed`
5. เริ่ม development server: `bun run dev` แล้วเปิด [http://localhost:3000](http://localhost:3000)

## คำสั่งที่ใช้

| คำสั่ง | หน้าที่ |
| --- | --- |
| `bun run dev` | เปิดเซิร์ฟเวอร์สำหรับพัฒนา |
| `bun run lint` | ตรวจโค้ดด้วย ESLint |
| `bun run typecheck` | ตรวจชนิดข้อมูล TypeScript |
| `bun test` | รัน test |
| `bun run build` | สร้าง Prisma client และ production build |
| `bun run start` | เปิด production server หลัง build สำเร็จ |
| `bunx prisma db push` | ทำให้ฐานข้อมูลตรงกับ schema |
| `bunx prisma db seed` | ใส่ข้อมูลตัวอย่าง |

## การจัดการ dependencies และ bun.lock

ใช้ Bun เป็นหลักในการติดตั้ง dependencies เพื่อให้ทุกคนอ้างอิง `bun.lock` เดียวกัน

- หลัง clone หรือ pull ใช้ `bun install --frozen-lockfile` เพื่อป้องกัน lockfile เปลี่ยนโดยไม่ตั้งใจ
- เมื่อเพิ่มแพ็กเกจ ใช้ `bun add ชื่อแพ็กเกจ` หรือ `bun add -d ชื่อแพ็กเกจ` สำหรับเครื่องมือพัฒนา
- Commit `package.json` และ `bun.lock` ร่วมกันเมื่อเปลี่ยน dependencies ไม่แก้รายการแพ็กเกจใน lockfile ด้วยมือ
- มี `package-lock.json` เดิมอยู่ใน repository ด้วย ไม่ควรสลับ `npm install` กับ `bun install` โดยไม่ตกลงกับทีม เพราะ lockfile ทั้งสองชุดอาจต่างกัน
- ใช้ `trustedDependencies` สำหรับ `sharp` และ `unrs-resolver` ตามการตั้งค่าโปรเจกต์

เอกสารอ้างอิง: [Bun lockfile](https://bun.com/docs/pm/lockfile) และ [dependency lifecycle scripts](https://bun.com/docs/pm/lifecycle)

## โครงสร้างไฟล์หลัก

```text
auth.ts                       # Auth.js: Google + อีเมล/รหัสผ่าน และการจำกัดการลองรหัส
auth.config.ts                # ส่วนที่ proxy ใช้ร่วม: เช็คล็อกอิน และข้อมูลใน JWT
proxy.ts                      # กันหน้าที่ต้องล็อกอิน
app/
  layout.tsx                  # Layout, metadata, ฟอนต์ และ footer
  page.tsx                    # หน้าแรก
  components/                 # ส่วนประกอบที่ใช้ร่วมกัน (navbar, ฟอร์ม auth, รายการหลักสูตร ฯลฯ)
  data/                       # ข้อมูลคงที่ของหน้าแรก: หลักสูตรแนะนำ ข่าว ข้อมูลองค์กร
  courses/ learn/ certificates/ dashboard/ admin/ login/ register/ privacy/
  api/register/               # API สมัครสมาชิก
  api/me/                     # รูปโปรไฟล์ และดาวน์โหลดข้อมูลส่วนตัว
lib/
  prisma.ts                   # Prisma client ตัวเดียวทั้งแอป
  courses.ts                  # อ่านหลักสูตรที่เผยแพร่แล้ว
  admin/                      # action และ schema ของหลังบ้าน
  learn/                      # ลงทะเบียน บันทึกความคืบหน้า และตรวจแบบทดสอบ
  profile/                    # แก้โปรไฟล์และรหัสผ่าน
prisma/
  schema.prisma               # โครงสร้างฐานข้อมูล
  seed.ts                     # ข้อมูลตัวอย่าง
```

## สีและฟอนต์

สีธีมกำหนดเป็น CSS variables ด้านบนของ `app/globals.css` ให้แก้ที่นั่นที่เดียว

ฟอนต์: [IBM Plex Sans Thai](https://fonts.google.com/specimen/IBM+Plex+Sans+Thai) สำหรับหัวข้อ และ [IBM Plex Sans Thai Looped](https://fonts.google.com/specimen/IBM+Plex+Sans+Thai+Looped) สำหรับเนื้อหา โหลดจากไฟล์ใน `app/fonts` ผ่าน `next/font/local` (ไม่ต้องต่ออินเทอร์เน็ตตอน build) ภาพประกอบอยู่ใน `public/media` พร้อมเครดิตใน `credits.json`

## งานที่ยังเหลือ

- หลักสูตรแนะนำบนหน้าแรกยังมาจากข้อมูลคงที่ใน `app/data/courses.ts` ไม่ได้อ่านจากฐานข้อมูล หลักสูตรที่แอดมินสร้างใหม่จึงยังไม่ขึ้นหน้าแรก และการ์ดที่ไม่มีหลักสูตรตรง slug ในฐานข้อมูลจะเปิดไม่เจอ
- ลืมรหัสผ่านและการส่งอีเมล (ยังไม่มีบริการส่งอีเมล)
- จำกัดจำนวนครั้งการสมัครสมาชิก
- รูปปกและรูปโปรไฟล์เก็บเป็น base64 ในฐานข้อมูล ถ้าหลักสูตรมีมากควรย้ายไปที่เก็บไฟล์ เช่น S3 หรือ R2
- ตั้งค่า deploy และการสำรองฐานข้อมูล
- ข่าวประกาศและช่องทางติดต่อจริง

## การทำงานร่วมกันด้วย Git

แต่ละคนสร้าง branch จาก `main` ล่าสุด และรวมงานผ่าน Pull Request ตรวจให้ working tree พร้อมก่อนสลับ branch:

```powershell
git switch main
git pull --ff-only origin main
git switch -c feat/ชื่อฟีเจอร์
```

เมื่อทำงานเสร็จ ให้เลือก stage เฉพาะไฟล์ที่เกี่ยวข้อง ตรวจ `git diff --cached` แล้ว commit/push branch ของตัวเอง เปิด Pull Request ไปยัง `main` ให้ทีมรีวิว หากต้องแก้ `layout.tsx`, `globals.css` หรือไฟล์ส่วนกลางร่วมกัน ให้ตกลงขอบเขตกับเพื่อนก่อน
