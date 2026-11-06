"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PublicHeader from "@/components/PublicHeader";
import RequireRole from "@/components/RequireRole";
import { Ticket, Calendar, MapPin, QrCode, ArrowRight, ShieldCheck } from "lucide-react";
import { formatDate, formatIDR } from "@/lib/format";

function MyTicketsList() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/tickets")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setTickets(data);
      })
      .catch((err) => console.error("Fetch tickets error:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen text-slate-100">
      <PublicHeader />

      <main className="mx-auto max-w-5xl px-6 py-12">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-8 border-b border-white/5">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-violet-500/10 border border-violet-500/30 px-3 py-1 text-xs font-semibold text-violet-300">
              <ShieldCheck size={14} className="text-emerald-400" />
              E-Ticket Resmi & Terverifikasi
            </div>
            <h1 className="mt-3 text-3xl font-black text-white">Tiket Konser Saya</h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-400">
              Dynamic QR Code berotasi setiap 30 detik untuk memastikan keamanan masuk venue.
            </p>
          </div>

          <Link
            href="/"
            className="self-start rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-violet-600/30 hover:opacity-95"
          >
            Cari Konser Lain
          </Link>
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
            <p className="text-xs text-slate-400">Memuat tiket digital...</p>
          </div>
        ) : tickets.length === 0 ? (
          <div className="py-20 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 text-slate-400">
              <Ticket size={28} />
            </div>
            <h3 className="text-base font-bold text-white">Belum Ada Tiket</h3>
            <p className="mt-1 text-xs text-slate-400 max-w-sm mx-auto">
              Kamu belum memiliki e-ticket konser aktif. Jelajahi katalog konser dan lakukan pemesanan sekarang!
            </p>
            <Link
              href="/"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-xs font-semibold text-white transition-all hover:bg-violet-700"
            >
              Jelajahi Konser
              <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            {tickets.map((t) => (
              <div
                key={t.id}
                className="glass-card overflow-hidden rounded-2xl border border-white/10 bg-[#12141F] flex flex-col justify-between"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className="rounded-full bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-400">
                        {t.category.name}
                      </span>
                      <h3 className="mt-2 text-lg font-bold text-white line-clamp-1">{t.event.title}</h3>
                    </div>

                    <span
                      className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                        t.isCheckedIn
                          ? "bg-slate-800 text-slate-400 border border-slate-700"
                          : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      }`}
                    >
                      {t.isCheckedIn ? "Sudah Digunakan" : "Siap Masuk"}
                    </span>
                  </div>

                  <div className="mt-4 space-y-2 text-xs text-slate-400">
                    <p className="flex items-center gap-2">
                      <MapPin size={14} className="text-violet-400 shrink-0" />
                      <span className="truncate">{t.event.venueName}, {t.event.venueCity}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <Calendar size={14} className="text-amber-400 shrink-0" />
                      <span>{formatDate(t.event.startDatetime.slice(0, 10))}</span>
                    </p>
                  </div>

                  <div className="mt-6 flex items-center justify-between border-t border-white/5 pt-4 text-xs">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-slate-400">Kode Tiket</p>
                      <p className="font-mono font-bold text-white">{t.ticketCode}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] uppercase tracking-wider text-slate-400">Atas Nama</p>
                      <p className="font-medium text-slate-200">{t.attendeeName}</p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-dashed border-white/10 bg-white/[0.02] p-4 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-amber-400 font-mono">
                    <QrCode size={16} />
                    <span>Dynamic QR Active</span>
                  </div>

                  <Link
                    href={`/account/tickets/${t.orderNumber}`}
                    className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-violet-600/20 transition-all hover:opacity-95"
                  >
                    Buka QR Code
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default function MyTicketsPage() {
  return (
    <RequireRole roles={["customer", "admin", "super_admin"]}>
      <MyTicketsList />
    </RequireRole>
  );
}

