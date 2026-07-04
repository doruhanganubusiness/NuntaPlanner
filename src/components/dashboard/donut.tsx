import { formatRON } from "@/lib/utils";

export type DonutSegment = { label: string; pct: number; amount: number | null };

const PALETTE = [
  "#b04a6f",
  "#d98a5b",
  "#5b8bd9",
  "#6bab7f",
  "#c9a13b",
  "#8d6bd9",
  "#d95b8b",
  "#7c6f68",
];

/** Donut simplu în SVG pentru alocarea bugetului. */
export function Donut({ segments }: { segments: DonutSegment[] }) {
  const r = 60;
  const c = 2 * Math.PI * r;
  // Offset cumulat pentru fiecare segment, precalculat fără mutație în render.
  const offsets = segments.map((_, i) =>
    segments.slice(0, i).reduce((sum, seg) => sum + seg.pct * c, 0),
  );

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
      <svg viewBox="0 0 160 160" className="h-40 w-40 -rotate-90">
        {segments.map((s, i) => {
          const len = s.pct * c;
          return (
            <circle
              key={i}
              cx="80"
              cy="80"
              r={r}
              fill="none"
              stroke={PALETTE[i % PALETTE.length]}
              strokeWidth="20"
              strokeDasharray={`${len} ${c - len}`}
              strokeDashoffset={-offsets[i]}
            />
          );
        })}
      </svg>
      <ul className="flex-1 space-y-1.5 text-sm">
        {segments.map((s, i) => (
          <li key={i} className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2">
              <span
                className="inline-block h-3 w-3 rounded-sm"
                style={{ background: PALETTE[i % PALETTE.length] }}
              />
              {s.label}
            </span>
            <span className="text-muted-foreground">
              {Math.round(s.pct * 100)}%
              {s.amount != null && ` · ${formatRON(s.amount)}`}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
