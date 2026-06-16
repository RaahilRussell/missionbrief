"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { UploadCloud, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

type Status =
  | { kind: "idle" }
  | { kind: "uploading" }
  | { kind: "success"; message: string }
  | { kind: "error"; message: string };

export function UploadForm() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [dragging, setDragging] = useState(false);
  const [, startTransition] = useTransition();

  async function upload(file: File) {
    setStatus({ kind: "uploading" });
    const body = new FormData();
    body.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Upload failed");
      setStatus({
        kind: "success",
        message: `Ingested ${data.filename} — ${data.metricCount} metric${
          data.metricCount === 1 ? "" : "s"
        } extracted.`,
      });
      startTransition(() => router.refresh());
    } catch (err) {
      setStatus({
        kind: "error",
        message: err instanceof Error ? err.message : "Upload failed",
      });
    }
  }

  function onFiles(files: FileList | null) {
    if (files && files.length > 0) void upload(files[0]);
  }

  return (
    <div>
      <label
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          onFiles(e.dataTransfer.files);
        }}
        className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-10 text-center transition ${
          dragging
            ? "border-brand-400 bg-brand-50"
            : "border-slate-200 bg-slate-50 hover:border-brand-300 hover:bg-brand-50/40"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv,.md,.markdown,.txt,.json"
          className="hidden"
          onChange={(e) => onFiles(e.target.files)}
        />
        {status.kind === "uploading" ? (
          <Loader2 className="h-7 w-7 animate-spin text-brand-600" />
        ) : (
          <UploadCloud className="h-7 w-7 text-brand-600" />
        )}
        <p className="text-sm font-medium text-slate-700">
          Drop a file here or click to upload
        </p>
        <p className="text-xs text-slate-400">
          CSV, Markdown, TXT, or JSON · up to 2 MB
        </p>
      </label>

      {status.kind === "success" && (
        <p className="mt-3 flex items-center gap-2 text-sm text-emerald-600">
          <CheckCircle2 className="h-4 w-4" /> {status.message}
        </p>
      )}
      {status.kind === "error" && (
        <p className="mt-3 flex items-center gap-2 text-sm text-rose-600">
          <AlertCircle className="h-4 w-4" /> {status.message}
        </p>
      )}
    </div>
  );
}
