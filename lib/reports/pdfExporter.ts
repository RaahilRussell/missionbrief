// PDF export.
//
// To keep the demo dependency-light and reliable (no headless Chromium in CI),
// PDF export uses the browser's native print-to-PDF on a print-optimised view.
// The report page ships a dedicated print stylesheet so the printed/saved PDF
// is clean. Call this from a client component.

export function exportReportToPdf(): void {
  if (typeof window === "undefined") return;
  window.print();
}
