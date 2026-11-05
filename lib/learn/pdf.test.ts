import { expect, test } from "bun:test";
import { pdfEmbedUrl } from "./pdf";

test("pdfEmbedUrl", () => {
  expect(pdfEmbedUrl("https://drive.google.com/file/d/abc_123-X/view?usp=sharing")).toBe("https://drive.google.com/file/d/abc_123-X/preview");
  expect(pdfEmbedUrl("https://example.com/files/manual.PDF?v=2")).toBe("https://example.com/files/manual.PDF?v=2");
  expect(pdfEmbedUrl("https://example.com/page")).toBeNull();
  expect(pdfEmbedUrl(null)).toBeNull();
});
