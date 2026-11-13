"use client";

import { useMemo, useState } from "react";
import { useData } from "@/lib/store";
import { GENRES } from "@/lib/data";
import PublicHeader from "@/components/PublicHeader";
import EventCard from "@/components/EventCard";
import { Search, Sparkles, ShieldCheck, Zap, QrCode, Flame } from "lucide-react";

export default function HomePage() {
  const { events, loading } = useData();
  const [query, setQuery] = useState("");
  const [genre, setGenre] = useState("Semua");

  const published = useMemo(() => events.filter((e) => e.status === "published"), [events]);

  const filtered = useMemo(() => {
    return published.filter((e) => {
      const matchesGenre = genre === "Semua" || e.genre === genre;
      const matchesQuery = `${e.name || e.title} ${e.venue} ${e.city}`.toLowerCase().includes(query.toLowerCase());
      return matchesGenre && matchesQuery;
    });
  }, [published, query, genre]);

  const warTicketEvents = useMemo(() => published.filter((e) => e.highDemand), [published]);

  return (
    <div className="min-h-screen text-slate-100">
      <PublicHeader />

      {/* Hero Section with Concert Ambiance */}
      <section className="relative overflow-hidden border-b border-white/5 py-16 sm:py-20">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(124,58,237,0.25),rgba(255,255,255,0))]" />
        
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-3xl">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-3.5 py-1.5 text-xs font-semibold text-violet-300 backdrop-blur-md">
              <Sparkles size={14} className="text-amber-400" />
              Platform Pemesanan Tiket Konser & Festival Resmi
            </div>

            <h1 className="mt-5 text-4xl font-black tracking-tight text-white sm:text-6xl">
              Rasakan Euforia Musik, <br />
              <span className="bg-gradient-to-r from-violet-400 via-indigo-300 to-amber-300 bg-clip-text text-transparent">
                Amankan Tiket Konsermu.
              </span>
            </h1>

            <p className="mt-4 text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
              Sistem antrean virtual berkecepatan tinggi, pembayaran instan via Midtrans Snap & QRIS, dan e-ticket Dynamic QR Code anti-calo terverifikasi.
            </p>

            {/* Modern Search Bar */}
            <div className="mt-8 flex max-w-xl items-center gap-3 rounded-2xl border border-white/10 bg-[#12141F]/80 p-2 backdrop-blur-xl shadow-2xl shadow-violet-950/30">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-600/20 text-violet-400">
                <Search size={18} />
              </div>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari nama artis, festival, venue, atau kota..."
                className="w-full bg-transparent text-sm text-white placeholder:text-slate-400 focus:outline-none"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="rounded-lg px-2 text-xs text-slate-400 hover:text-white"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* Trust Highlights */}
          <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-3 max-w-3xl">
            <div className="flex items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.02] p-3.5 backdrop-blur-md">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
                <Flame size={20} />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Virtual War Room</p>
                <p className="text-[11px] text-slate-400">Antrean adil tanpa server crash</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.02] p-3.5 backdrop-blur-md">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">
                <QrCode size={20} />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Dynamic QR Code</p>
                <p className="text-[11px] text-slate-400">Rotasi token 30 detik anti-calo</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.02] p-3.5 backdrop-blur-md">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                <ShieldCheck size={20} />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Midtrans Official Gateway</p>
                <p className="text-[11px] text-slate-400">QRIS & Virtual Account instan settlement</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Concert Catalog */}
      <section className="mx-auto max-w-7xl px-6 py-12">
        {/* Genre / Category Filter Pills */}
        <div className="flex items-center justify-between gap-4 flex-wrap pb-6 border-b border-white/5">
          <div className="flex flex-wrap gap-2">
            {["Semua", ...GENRES].map((g) => (
              <button
                key={g}
                onClick={() => setGenre(g)}
                className={`rounded-full px-4 py-2 text-xs font-semibold transition-all ${
                  genre === g
                    ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-600/30"
                    : "border border-white/10 bg-[#12141F] text-slate-400 hover:border-white/20 hover:text-white"
                }`}
              >
                {g}
              </button>
            ))}
          </div>

          <div className="text-xs font-medium text-slate-400">
            Menampilkan <span className="font-bold text-amber-400">{filtered.length}</span> event aktif
          </div>
        </div>

        {/* Concert Cards Grid */}
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {!loading && filtered.length === 0 && (
            <div className="col-span-full py-16 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white/5 text-slate-400">
                <Search size={24} />
              </div>
              <p className="text-base font-semibold text-white">Tidak ada konser yang cocok</p>
              <p className="mt-1 text-xs text-slate-400">Coba ganti kata kunci pencarian atau kategori genre.</p>
            </div>
          )}

          {filtered.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </section>
    </div>
  );
}
