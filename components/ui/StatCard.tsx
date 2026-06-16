import { cn } from "@/lib/cn";

export function StatCard({
  label,
  value,
  hint,
  icon,
  accent = "brand",
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon?: React.ReactNode;
  accent?: "brand" | "emerald" | "amber" | "rose" | "sky";
}) {
  const accents: Record<string, string> = {
    brand: "text-brand-600 bg-brand-50",
    emerald: "text-emerald-600 bg-emerald-50",
    amber: "text-amber-600 bg-amber-50",
    rose: "text-rose-600 bg-rose-50",
    sky: "text-sky-600 bg-sky-50",
  };
  return (
    <div className="card flex items-start gap-4 p-5">
      {icon && (
        <div className={cn("rounded-xl p-2.5", accents[accent])}>{icon}</div>
      )}
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
          {label}
        </p>
        <p className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
          {value}
        </p>
        {hint && <p className="mt-0.5 truncate text-xs text-slate-400">{hint}</p>}
      </div>
    </div>
  );
}
