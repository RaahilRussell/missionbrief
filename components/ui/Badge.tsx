import { cn } from "@/lib/cn";

type Tone = "brand" | "emerald" | "amber" | "rose" | "slate" | "sky";

const TONES: Record<Tone, string> = {
  brand: "bg-brand-50 text-brand-700 ring-brand-200",
  emerald: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  amber: "bg-amber-50 text-amber-700 ring-amber-200",
  rose: "bg-rose-50 text-rose-700 ring-rose-200",
  slate: "bg-slate-100 text-slate-600 ring-slate-200",
  sky: "bg-sky-50 text-sky-700 ring-sky-200",
};

export function Badge({
  children,
  tone = "slate",
  className,
}: {
  children: React.ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Map a metric category to a badge tone. */
export function categoryTone(category: string): Tone {
  switch (category) {
    case "Financial":
      return "sky";
    case "Grant":
      return "brand";
    case "Fundraising":
      return "emerald";
    case "Outcome":
      return "emerald";
    case "Risk":
      return "rose";
    default:
      return "slate";
  }
}
