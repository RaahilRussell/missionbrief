import { formatMoney, formatPercent } from "@/lib/format";

export function BudgetDonut({
  spent,
  remaining,
  total,
}: {
  spent: number;
  remaining: number;
  total: number;
}) {
  if (total <= 0) {
    return (
      <p className="py-10 text-center text-sm text-slate-400">
        No budget data available.
      </p>
    );
  }

  const pct = (spent / total) * 100;
  const r = 52;
  const c = 2 * Math.PI * r;
  const spentLen = (Math.min(pct, 100) / 100) * c;

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
      <svg viewBox="0 0 140 140" className="h-36 w-36 -rotate-90">
        <circle cx="70" cy="70" r={r} fill="none" stroke="#eef0f6" strokeWidth={16} />
        <circle
          cx="70"
          cy="70"
          r={r}
          fill="none"
          stroke="#4f46e5"
          strokeWidth={16}
          strokeLinecap="round"
          strokeDasharray={`${spentLen} ${c - spentLen}`}
        />
        <text
          x="70"
          y="68"
          textAnchor="middle"
          fontSize="20"
          fontWeight="700"
          fill="#0f172a"
          transform="rotate(90 70 70)"
        >
          {formatPercent(pct)}
        </text>
        <text
          x="70"
          y="86"
          textAnchor="middle"
          fontSize="9"
          fill="#94a3b8"
          transform="rotate(90 70 70)"
        >
          utilized
        </text>
      </svg>
      <div className="space-y-2 text-sm">
        <Row color="#4f46e5" label="Spent" value={formatMoney(spent)} />
        <Row color="#e2e8f0" label="Remaining" value={formatMoney(remaining)} />
        <div className="border-t border-slate-100 pt-2 text-xs text-slate-500">
          Total budget {formatMoney(total)}
        </div>
      </div>
    </div>
  );
}

function Row({
  color,
  label,
  value,
}: {
  color: string;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span
        className="h-2.5 w-2.5 rounded-full"
        style={{ backgroundColor: color }}
      />
      <span className="w-20 text-slate-500">{label}</span>
      <span className="font-medium tabular-nums text-slate-900">{value}</span>
    </div>
  );
}
