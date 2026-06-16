"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Download, Copy, Check, Printer, Trash2, Loader2 } from "lucide-react";
import { exportReportToPdf } from "@/lib/reports/pdfExporter";

export function ReportActions({
  reportId,
  contentMarkdown,
}: {
  reportId: string;
  contentMarkdown: string;
}) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [, startTransition] = useTransition();

  async function copy() {
    await navigator.clipboard.writeText(contentMarkdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  async function remove() {
    setDeleting(true);
    try {
      await fetch(`/api/reports/${reportId}`, { method: "DELETE" });
      startTransition(() => {
        router.push("/reports/new");
        router.refresh();
      });
    } catch {
      setDeleting(false);
    }
  }

  const btn =
    "inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50";

  return (
    <div className="no-print flex flex-wrap gap-2">
      <a href={`/api/export/${reportId}`} className={btn} download>
        <Download className="h-4 w-4" /> Markdown
      </a>
      <button onClick={() => exportReportToPdf()} className={btn}>
        <Printer className="h-4 w-4" /> Export PDF
      </button>
      <button onClick={copy} className={btn}>
        {copied ? (
          <Check className="h-4 w-4 text-emerald-600" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
        {copied ? "Copied" : "Copy"}
      </button>
      <button
        onClick={remove}
        disabled={deleting}
        className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-rose-600 transition hover:bg-rose-50 disabled:opacity-60"
      >
        {deleting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Trash2 className="h-4 w-4" />
        )}
        Delete
      </button>
    </div>
  );
}
