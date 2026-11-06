"use client";

import Link from "next/link";
import { useData } from "@/lib/store";
import { formatDate, formatIDR } from "@/lib/format";
import QuotaBar from "@/components/QuotaBar";
import EventPoster from "@/components/EventPoster";
import { ArrowUpRight, Plus, Ticket, DollarSign, Calendar, TrendingUp } from "lucide-react";

function totalsFor(events) {
  let sold = 0;
  let quota = 0;
  let revenue = 0;
  let live = 0;
  for (const e of events) {
    if (e.status === "published") live += 1;
    for (const c of e.categories || []) {
      sold += c.sold || 0;
      quota += c.quota || 0;
      revenue += (c.sold || 0) * (c.price || 0);
    }
  }
  return { sold, quota, revenue, live };
}

export default function DashboardPage() {
  const { events, loading } = useData();

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
        <p className="text-xs text-slate-400">Memuat analitik promotor...</p>
      </div>
    );
  }

  const t = totalsFor(events);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-white/5">
        <div>
          <h1 className="text-3xl font-black text-white">Dashboard Promotor</h1>
          <p className="mt-1 text-xs text-slate-400">
            Pantau penjualan tiket real-time, sisa kuota kategori, dan estimasi bagi hasil kotor.
          </p>
        </div>

        <Link
          href="/admin/events/new"
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-violet-600/30 transition-all hover:opacity-95"
        >
          <Plus size={16} />
          Buat Event Baru
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="glass-panel rounded-2xl p-6 border border-white/10 bg-[#12141F]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Event Aktif</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">
              <Calendar size={18} />
            </div>
          </div>
          <p className="mt-4 text-3xl font-black text-white">{t.live}</p>
          <p className="mt-1 text-xs text-slate-400">Dari total {events.length} event terdaftar</p>
        </div>

        <div className="glass-panel rounded-2xl p-6 border border-white/10 bg-[#12141F]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Tiket Terjual</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
              <Ticket size={18} />
            </div>
          </div>
          <p className="mt-4 text-3xl font-black text-white">{t.sold.toLocaleString("id-ID")}</p>
          <div className="mt-3 flex items-center gap-2">
            <div className="h-2 flex-1 rounded-full bg-white/5 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-violet-500 to-amber-500"
                style={{ width: `${Math.min(100, Math.round((t.sold / Math.max(t.quota, 1)) * 100))}%` }}
              />
            </div>
            <span className="text-xs font-mono font-bold text-amber-400">
              {Math.min(100, Math.round((t.sold / Math.max(t.quota, 1)) * 100))}%
            </span>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-6 border border-white/10 bg-[#12141F]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total GMV Penjualan</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
              <DollarSign size={18} />
            </div>
          </div>
          <p className="mt-4 text-3xl font-black text-amber-400">{formatIDR(t.revenue)}</p>
          <p className="mt-1 text-xs text-slate-400">Sebelum potongan platform fee 5%</p>
        </div>
      </div>

      {/* Events Breakdown */}
      <div className="glass-panel rounded-2xl border border-white/10 bg-[#12141F] p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-white">Performa Konser Aktif</h3>
            <p className="text-xs text-slate-400">Monitoring kuota tiket dan status penayangan tiap event</p>
          </div>
          <Link href="/admin/events" className="text-xs font-semibold text-violet-400 hover:text-violet-300">
            Kelola Semua Event →
          </Link>
        </div>

        <div className="space-y-4">
          {events.map((e) => {
            const sold = e.categories?.reduce((sum, c) => sum + (c.sold || 0), 0) || 0;
            const quota = e.categories?.reduce((sum, c) => sum + (c.quota || 0), 0) || 1;
            const percentage = Math.round((sold / quota) * 100);

            return (
              <div
                key={e.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-white/5 bg-white/[0.02] p-4 transition-all hover:bg-white/[0.04]"
              >
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-slate-800">
                    <EventPoster event={e} className="h-full w-full object-cover" />
                  </div>
                  <div>
                    <span className="rounded-full bg-violet-500/10 border border-violet-500/30 px-2 py-0.5 text-[10px] font-semibold uppercase text-violet-300">
                      {e.genre}
                    </span>
                    <h4 className="mt-1 text-sm font-bold text-white">{e.name || e.title}</h4>
                    <p className="text-xs text-slate-400">{e.venue}, {e.city} • {formatDate(e.date)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6 sm:w-72 justify-between">
                  <div className="w-full">
                    <div className="flex justify-between text-xs text-slate-400 mb-1">
                      <span>Terjual {sold.toLocaleString("id-ID")} / {quota.toLocaleString("id-ID")}</span>
                      <span className="font-mono font-bold text-amber-400">{percentage}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-violet-500 to-amber-500"
                        style={{ width: `${Math.min(100, percentage)}%` }}
                      />
                    </div>
                  </div>

                  <Link
                    href={`/admin/events/${e.id}`}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/5 text-slate-300 hover:bg-violet-600 hover:text-white transition-all"
                  >
                    <ArrowUpRight size={16} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
