"use client";

export function PrintButton() {
  return (
    <button type="button" className="button button-primary no-print" onClick={() => window.print()}>
      พิมพ์หรือบันทึกเป็น PDF
    </button>
  );
}
