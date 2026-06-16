"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Database, RotateCcw, Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";

export function SampleDataControls({
  variant = "full",
}: {
  variant?: "full" | "compact";
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [busy, setBusy] = useState<null | "seed" | "reset">(null);
  const [message, setMessage] = useState<string | null>(null);

  async function run(action: "seed" | "reset") {
    setBusy(action);
    setMessage(null);
    try {
      const res = await fetch(`/api/${action}`, { method: "POST" });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Request failed");
      setMessage(
        action === "seed"
          ? `Loaded ${data.fileCount} files · ${data.metricCount} metrics extracted`
          : "Workspace cleared",
      );
      startTransition(() => router.refresh());
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(null);
    }
  }

  const loading = busy !== null || pending;

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-2",
        variant === "full" && "sm:gap-3",
      )}
    >
      <button
        onClick={() => run("seed")}
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-3.5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-brand-700 disabled:opacity-60"
      >
        {busy === "seed" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Database className="h-4 w-4" />
        )}
        Load BrightPath Demo Data
      </button>
      <button
        onClick={() => run("reset")}
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-60"
      >
        {busy === "reset" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <RotateCcw className="h-4 w-4" />
        )}
        Reset
      </button>
      {message && (
        <span className="text-xs text-slate-500" role="status">
          {message}
        </span>
      )}
    </div>
  );
}
