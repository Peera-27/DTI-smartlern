/** ลิงก์ที่ฝังใน iframe ได้: Google Drive (เปลี่ยนเป็น /preview) หรือไฟล์ .pdf ตรงๆ ไม่ใช่ PDF คืน null */
export function pdfEmbedUrl(url: string | null): string | null {
  if (!url) return null;
  const drive = url.match(/^https:\/\/drive\.google\.com\/file\/d\/([\w-]+)/);
  if (drive) return `https://drive.google.com/file/d/${drive[1]}/preview`;
  return /^https:\/\/[^?#]+\.pdf(?:[?#]|$)/i.test(url) ? url : null;
}
