"use client";

import { useMemo } from "react";
import { useData } from "@/lib/store";
import { formatIDR } from "@/lib/format";
import QuotaBar from "@/components/QuotaBar";
import BarChart from "@/components/BarChart";

function dayLabel(iso) {
  return new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short" }).format(new Date(iso));
}

export default function AnalyticsPage() {
  const { events, orders, loading } = useData();

  const perEvent = useMemo(() => {
    return events
      .map((e) => {
        const sold = e.categories.reduce((n, c) => n + c.sold, 0);
        const quota = e.categories.reduce((n, c) => n + c.quota, 0);
        const revenue = e.categories.reduce((n, c) => n + c.sold * c.price, 0);
        return { ...e, sold, quota, revenue };
      })
      .sort((a, b) => b.revenue - a.revenue);
  }, [events]);

  const totals = useMemo(
    () =>
      orders.reduce(
        (acc, o) => {
          if (o.status === "blocked") return acc;
          acc.revenue += o.total;
          acc.tickets += o.qty;
          acc.orders += 1;
          return acc;
        },
        { revenue: 0, tickets: 0, orders: 0 }
      ),
    [orders]
  );

  const daily = useMemo(() => {
    const map = new Map();
    for (const o of orders) {
      if (o.status === "blocked") continue;
      const key = o.createdAt.slice(0, 10);
      map.set(key, (map.get(key) || 0) + o.total);
    }
    return Array.from(map.entries())
      .sort(([a], [b]) => (a < b ? -1 : 1))
      .map(([date, value]) => ({ label: dayLabel(date), value }));
  }, [orders]);

  const byGenre = useMemo(() => {
    const map = new Map();
    for (const e of perEvent) {
      map.set(e.genre, (map.get(e.genre) || 0) + e.revenue);
    }
    const max = Math.max(1, ...Array.from(map.values()));
    return Array.from(map.entries())
      .sort(([, a], [, b]) => b - a)
      .map(([genre, revenue]) => ({ genre, revenue, pct: Math.round((revenue / max) * 100) }));
  }, [perEvent]);

  if (loading) return <p className="text-silver-dim">Memuat data…</p>;

  return (
    <div>
      <h1 className="font-display text-3xl tracking-tight text-paper">Analitik penjualan</h1>
      <p className="mt-1 text-sm text-silver-dim">Ringkasan performa seluruh event.</p>

      <div className="mt-8 grid grid-cols-3 gap-px overflow-hidden rounded-lg border border-line bg-line">
        <div className="bg-panel px-5 py-4">
          <p className="text-sm text-silver-dim">Total pendapatan</p>
          <p className="mt-1 font-display text-2xl text-paper">{formatIDR(totals.revenue)}</p>
        </div>
        <div className="bg-panel px-5 py-4">
          <p className="text-sm text-silver-dim">Tiket terjual</p>
          <p className="mt-1 font-display text-2xl text-paper">{totals.tickets.toLocaleString("id-ID")}</p>
        </div>
        <div className="bg-panel px-5 py-4">
          <p className="text-sm text-silver-dim">Rata-rata nilai transaksi</p>
          <p className="mt-1 font-display text-2xl text-paper">
            {formatIDR(totals.orders ? totals.revenue / totals.orders : 0)}
          </p>
        </div>
      </div>

      <div className="mt-10 rounded-lg border border-line bg-panel p-5">
        <h2 className="font-display text-lg tracking-tight text-paper">Tren pendapatan harian</h2>
        <p className="mt-1 text-xs text-silver-dim">Berdasarkan tanggal transaksi tercatat.</p>
        <div className="mt-5">
          {daily.length > 0 ? (
            <BarChart data={daily} formatValue={formatIDR} />
          ) : (
            <p className="text-sm text-silver-dim">Belum ada transaksi.</p>
          )}
        </div>
      </div>

      <div className="mt-10 grid grid-cols-2 gap-6">
        <div>
          <h2 className="font-display text-lg tracking-tight text-paper">Performa per event</h2>
          <div className="mt-4 space-y-3">
            {perEvent.map((e) => (
              <div key={e.id} className="rounded-md border border-line bg-panel px-4 py-3.5">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-paper">{e.name}</p>
                  <p className="text-sm text-gold">{formatIDR(e.revenue)}</p>
                </div>
                <QuotaBar sold={e.sold} quota={e.quota || 1} className="mt-2" />
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="font-display text-lg tracking-tight text-paper">Pendapatan per genre</h2>
          <div className="mt-4 space-y-4 rounded-md border border-line bg-panel px-4 py-4">
            {byGenre.map((g) => (
              <div key={g.genre}>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-silver">{g.genre}</span>
                  <span className="text-paper">{formatIDR(g.revenue)}</span>
                </div>
                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-panel-raised">
                  <div className="h-full rounded-full bg-gold" style={{ width: `${g.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
