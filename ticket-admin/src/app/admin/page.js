"use client";

import Link from "next/link";
import { useData } from "@/lib/store";
import { formatDate, formatIDR } from "@/lib/format";
import QuotaBar from "@/components/QuotaBar";
import EventPoster from "@/components/EventPoster";
import { ArrowUpRight } from "lucide-react";

function totalsFor(events) {
  let sold = 0;
  let quota = 0;
  let revenue = 0;
  let live = 0;
  for (const e of events) {
    if (e.status === "published") live += 1;
    for (const c of e.categories) {
      sold += c.sold;
      quota += c.quota;
      revenue += c.sold * c.price;
    }
  }
  return { sold, quota, revenue, live };
}

const STATS = [
  { key: "live", label: "Event tayang" },
  { key: "sold", label: "Tiket terjual" },
  { key: "revenue", label: "Pendapatan kotor" },
];

export default function DashboardPage() {
  const { events, loading } = useData();

  if (loading) {
    return <p className="text-silver-dim">Memuat data…</p>;
  }

  const t = totalsFor(events);
  const values = {
    live: `${t.live}`,
    sold: t.sold.toLocaleString("id-ID"),
    revenue: formatIDR(t.revenue),
  };
  const meterMax = { live: Math.max(events.length, 1), sold: Math.max(t.quota, 1), revenue: Math.max(t.revenue, 1) };
  const meterVal = { live: t.live, sold: t.sold, revenue: t.revenue };

  return (
    <div>
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-display text-3xl tracking-tight text-paper">Ringkasan</h1>
          <p className="mt-1 text-sm text-silver-dim">Kondisi penjualan tiket saat ini.</p>
        </div>
        <Link
          href="/admin/events/new"
          className="rounded-md bg-gold px-4 py-2 text-sm font-medium text-ink transition-opacity hover:opacity-90"
        >
          Buat event
        </Link>
      </div>

      <div className="mt-8 grid grid-cols-3 gap-px overflow-hidden rounded-lg border border-line bg-line">
        {STATS.map((s) => (
          <div key={s.key} className="bg-panel px-5 py-5">
            <p className="text-sm text-silver-dim">{s.label}</p>
            <p className="mt-2 font-display text-3xl text-paper">{values[s.key]}</p>
            <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-panel-raised">
              <div
                className="h-full rounded-full bg-gold"
                style={{
                  width: `${Math.min(100, Math.round((meterVal[s.key] / meterMax[s.key]) * 100))}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 flex items-center justify-between">
        <h2 className="font-display text-xl tracking-tight text-paper">Event terbaru</h2>
        <Link
          href="/admin/events"
          className="flex items-center gap-1 text-sm text-silver hover:text-gold"
        >
          Lihat semua <ArrowUpRight size={14} />
        </Link>
      </div>

      <div className="mt-4 divide-y divide-line rounded-lg border border-line bg-panel">
        {events.length === 0 && (
          <p className="px-5 py-6 text-sm text-silver-dim">
            Belum ada event. Buat event pertama untuk mulai jual tiket.
          </p>
        )}
        {events.slice(0, 4).map((e) => {
          const sold = e.categories.reduce((n, c) => n + c.sold, 0);
          const quota = e.categories.reduce((n, c) => n + c.quota, 0);
          return (
            <Link
              key={e.id}
              href={`/admin/events/${e.id}`}
              className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-panel-raised/60"
            >
              <div className="h-10 w-16 shrink-0 overflow-hidden rounded border border-line bg-ink">
                <EventPoster event={e} className="h-full w-full object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-medium text-paper">{e.name}</p>
                  <span
                    className={`h-2 w-2 shrink-0 rounded-full ${
                      e.status === "published" ? "bg-gold" : "bg-silver-dim"
                    }`}
                    aria-hidden
                  />
                </div>
                <p className="text-xs text-silver-dim">
                  {e.venue}, {e.city} · {formatDate(e.date)}
                </p>
              </div>
              <QuotaBar sold={sold} quota={quota || 1} className="w-40 shrink-0" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
