import type { AttendancePoint } from "@/lib/queries";

export function AttendanceChart({ data }: { data: AttendancePoint[] }) {
  if (data.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-slate-400">
        No attendance data available.
      </p>
    );
  }

  const W = 620;
  const H = 200;
  const padX = 28;
  const padY = 22;
  const max = Math.max(...data.map((d) => d.attendees), 1);
  const innerW = W - padX * 2;
  const innerH = H - padY * 2;

  const x = (i: number) =>
    padX + (data.length === 1 ? innerW / 2 : (i / (data.length - 1)) * innerW);
  const y = (v: number) => padY + innerH - (v / max) * innerH;

  const linePts = data.map((d, i) => `${x(i)},${y(d.attendees)}`).join(" ");
  const areaPts = `${padX},${padY + innerH} ${linePts} ${padX + innerW},${padY + innerH}`;

  const gridLines = [0, 0.25, 0.5, 0.75, 1];

  return (
    <div className="w-full overflow-hidden">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-auto w-full"
        role="img"
        aria-label="Program attendance over time"
      >
        <defs>
          <linearGradient id="attFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
          </linearGradient>
        </defs>

        {gridLines.map((g) => {
          const gy = padY + innerH - g * innerH;
          return (
            <g key={g}>
              <line
                x1={padX}
                y1={gy}
                x2={padX + innerW}
                y2={gy}
                stroke="#eef0f6"
                strokeWidth={1}
              />
              <text x={4} y={gy + 3} fontSize={9} fill="#94a3b8">
                {Math.round(g * max)}
              </text>
            </g>
          );
        })}

        <polygon points={areaPts} fill="url(#attFill)" />
        <polyline
          points={linePts}
          fill="none"
          stroke="#4f46e5"
          strokeWidth={2.2}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {data.map((d, i) => (
          <circle key={i} cx={x(i)} cy={y(d.attendees)} r={2.5} fill="#4f46e5" />
        ))}
      </svg>
      <div className="mt-1 flex justify-between px-7 text-[10px] text-slate-400">
        <span>{data[0]?.date}</span>
        <span>{data[data.length - 1]?.date}</span>
      </div>
    </div>
  );
}
