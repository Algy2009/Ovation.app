export default function BarChart({ data, valueKey = "value", labelKey = "label", formatValue = (v) => v }) {
  const max = Math.max(1, ...data.map((d) => d[valueKey]));

  return (
    <div className="flex h-40 items-end gap-2">
      {data.map((d, i) => {
        const pct = Math.max(2, Math.round((d[valueKey] / max) * 100));
        return (
          <div key={i} className="group flex flex-1 flex-col items-center gap-2">
            <div className="relative flex w-full flex-1 items-end">
              <div
                className="w-full rounded-t-sm bg-gold/70 transition-colors group-hover:bg-gold"
                style={{ height: `${pct}%` }}
                title={formatValue(d[valueKey])}
              />
            </div>
            <span className="text-[10px] text-silver-dim">{d[labelKey]}</span>
          </div>
        );
      })}
    </div>
  );
}
