import type { MilestoneStatus } from "@/lib/queries";

const STATUS_COLOR: Record<string, string> = {
  completed: "bg-emerald-500",
  "in progress": "bg-sky-500",
  missed: "bg-rose-500",
  "not started": "bg-slate-300",
};

function colorFor(status: string): string {
  return STATUS_COLOR[status.toLowerCase()] ?? "bg-slate-400";
}

export function MilestoneBars({ data }: { data: MilestoneStatus[] }) {
  if (data.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-slate-400">
        No grant milestone data available.
      </p>
    );
  }
  const total = data.reduce((acc, d) => acc + d.count, 0);

  return (
    <div className="space-y-4">
      <div className="flex h-3 w-full overflow-hidden rounded-full bg-slate-100">
        {data.map((d) => (
          <div
            key={d.status}
            className={colorFor(d.status)}
            style={{ width: `${(d.count / total) * 100}%` }}
            title={`${d.status}: ${d.count}`}
          />
        ))}
      </div>
      <ul className="grid grid-cols-2 gap-2 text-sm">
        {data.map((d) => (
          <li key={d.status} className="flex items-center gap-2">
            <span className={`h-2.5 w-2.5 rounded-full ${colorFor(d.status)}`} />
            <span className="text-slate-600">{d.status}</span>
            <span className="ml-auto font-medium tabular-nums text-slate-900">
              {d.count}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
