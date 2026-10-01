type Props = {
  dates: string[];
  scores: number[]; // 0-100 per date
};

export default function Heatmap({ dates, scores }: Props) {
  const color = (s: number) => {
    if (s >= 80) return "bg-emerald-500";
    if (s >= 50) return "bg-indigo-500";
    if (s >= 20) return "bg-indigo-300 dark:bg-indigo-800";
    if (s > 0) return "bg-slate-300 dark:bg-slate-700";
    return "bg-slate-100 dark:bg-slate-800";
  };

  return (
    <div>
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-3">
        Last {dates.length} days
      </p>
      <div className="flex flex-wrap gap-1.5">
        {dates.map((d, i) => (
          <div
            key={d}
            title={`${d}: ${scores[i]}%`}
            className={`w-3.5 h-3.5 rounded-sm ${color(scores[i])}`}
          />
        ))}
      </div>
      <div className="flex gap-3 mt-3 text-[10px] text-slate-400">
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-slate-100 dark:bg-slate-800 inline-block" />0</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-indigo-300 inline-block" />20+</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-indigo-500 inline-block" />50+</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block" />80+</span>
      </div>
    </div>
  );
}