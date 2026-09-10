export default function QuotaBar({ sold, quota, className = "" }) {
  const pct = quota > 0 ? Math.min(100, Math.round((sold / quota) * 100)) : 0;
  const soldOut = quota > 0 && sold >= quota;

  return (
    <div className={className}>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-panel-raised">
        <div
          className={`h-full rounded-full transition-all ${soldOut ? "bg-red" : "bg-gold"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="mt-1.5 flex items-center justify-between text-xs text-silver-dim">
        <span>
          {sold.toLocaleString("id-ID")} / {quota.toLocaleString("id-ID")} terjual
        </span>
        <span className={soldOut ? "text-red" : "text-silver"}>
          {soldOut ? "Habis" : `${pct}%`}
        </span>
      </div>
    </div>
  );
}
