"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Sparkles, AlertCircle } from "lucide-react";
import { REPORT_TYPES, REPORT_TONES } from "@/lib/reports/types";
import { cn } from "@/lib/cn";

export function ReportForm({ hasData }: { hasData: boolean }) {
  const router = useRouter();
  const [reportType, setReportType] = useState("board-packet");
  const [periodLabel, setPeriodLabel] = useState("May 2026");
  const [tone, setTone] = useState("board-facing");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selected = REPORT_TYPES.find((r) => r.id === reportType);

  async function submit() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportType, periodLabel, tone }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Generation failed");
      router.push(`/reports/${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed");
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="mb-2 text-sm font-medium text-slate-700">Report type</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {REPORT_TYPES.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => setReportType(r.id)}
              className={cn(
                "rounded-xl border p-4 text-left transition",
                reportType === r.id
                  ? "border-brand-500 bg-brand-50 ring-1 ring-brand-200"
                  : "border-slate-200 bg-white hover:border-brand-300",
              )}
            >
              <p className="text-sm font-semibold text-slate-900">{r.name}</p>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">
                {r.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Reporting period
          </label>
          <input
            value={periodLabel}
            onChange={(e) => setPeriodLabel(e.target.value)}
            placeholder="e.g. May 2026"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Tone
          </label>
          <select
            value={tone}
            onChange={(e) => setTone(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm capitalize outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
          >
            {REPORT_TONES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      {selected && (
        <div className="rounded-xl bg-slate-50 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Sections included
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {selected.sections.map((s) => (
              <span
                key={s}
                className="rounded-md bg-white px-2 py-1 text-xs text-slate-600 ring-1 ring-slate-200"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {!hasData && (
        <p className="flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700">
          <AlertCircle className="h-4 w-4" /> No source data loaded yet. Load the
          BrightPath demo data or upload files first.
        </p>
      )}
      {error && (
        <p className="flex items-center gap-2 text-sm text-rose-600">
          <AlertCircle className="h-4 w-4" /> {error}
        </p>
      )}

      <button
        onClick={submit}
        disabled={submitting || !hasData}
        className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Sparkles className="h-4 w-4" />
        )}
        {submitting ? "Generating…" : "Generate Report"}
      </button>
    </div>
  );
}
