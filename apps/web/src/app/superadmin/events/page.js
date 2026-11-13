"use client";

import { useState } from "react";
import { useData } from "@/lib/store";
import { formatDate } from "@/lib/format";
import EventPoster from "@/components/EventPoster";
import { Check, X, Ticket, Calendar, MapPin, Eye } from "lucide-react";

export default function SuperAdminEventsPage() {
  const { events, updateEvent, loading } = useData();
  const [filter, setFilter] = useState("all");
  const [processingId, setProcessingId] = useState(null);

  if (loading) return <p className="text-silver-dim">Memuat data event…</p>;

  const filtered = events.filter((e) => {
    if (filter === "all") return true;
    return e.status === filter;
  });

  async function handleApprove(id) {
    setProcessingId(id);
    try {
      await updateEvent(id, { status: "PUBLISHED" });
    } catch (err) {
      alert("Gagal menyetujui event: " + err.message);
    } finally {
      setProcessingId(null);
    }
  }

  async function handleReject(id) {
    setProcessingId(id);
    try {
      await updateEvent(id, { status: "DRAFT" });
    } catch (err) {
      alert("Gagal mengubah status event: " + err.message);
    } finally {
      setProcessingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="pb-6 border-b border-white/5">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-violet-500/10 border border-violet-500/30 px-3 py-1 text-xs font-semibold text-violet-300 mb-2">
          <Ticket size={13} className="text-amber-400" />
          Event Quality & Legal Compliance
        </div>
        <h1 className="text-3xl font-black text-white">Moderasi & Kurasi Konser</h1>
        <p className="mt-1 text-xs text-slate-400">
          Tinjau draft konser promotor, pastikan legalitas izin keramaian dan venue sebelum dibuka untuk penjualan umum.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {["all", "draft", "published"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-xl px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-all ${
              filter === f
                ? "bg-violet-600 text-white shadow-md shadow-violet-600/20"
                : "bg-white/5 text-slate-400 hover:text-white"
            }`}
          >
            {f === "all" ? "Semua Event" : f === "draft" ? "Menunggu / Draf" : "Tayang (Live)"}
          </button>
        ))}
      </div>

      {/* Events List */}
      <div className="space-y-4">
        {filtered.length === 0 && (
          <div className="rounded-2xl border border-dashed border-white/10 p-12 text-center text-xs text-slate-500">
            Tidak ada event pada kategori ini.
          </div>
        )}

        {filtered.map((e) => (
          <div
            key={e.id}
            className="rounded-2xl border border-white/10 bg-[#12141F] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-5 hover:border-violet-500/30 transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="h-16 w-24 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-black/40">
                <EventPoster event={e} className="h-full w-full object-cover" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white">{e.name || e.title}</h3>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                      e.status === "published"
                        ? "bg-emerald-500/20 text-emerald-300"
                        : "bg-amber-500/20 text-amber-300"
                    }`}
                  >
                    {e.status}
                  </span>
                </div>

                <p className="mt-1 text-xs text-slate-400 flex items-center gap-2">
                  <span className="flex items-center gap-1"><MapPin size={11} className="text-violet-400" /> {e.venue || e.venueName}, {e.city || e.venueCity}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1"><Calendar size={11} className="text-amber-400" /> {formatDate(e.date || e.startDatetime?.slice(0, 10))}</span>
                </p>

                <p className="mt-1 text-[11px] text-slate-500 line-clamp-1 max-w-xl">
                  {e.description}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {e.status !== "published" ? (
                <button
                  onClick={() => handleApprove(e.id)}
                  disabled={processingId === e.id}
                  className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-emerald-600/20 hover:opacity-95 disabled:opacity-50"
                >
                  <Check size={14} /> Terbitkan (Publish)
                </button>
              ) : (
                <button
                  onClick={() => handleReject(e.id)}
                  disabled={processingId === e.id}
                  className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-300 hover:border-amber-500/40 hover:text-amber-400 disabled:opacity-50"
                >
                  <X size={14} /> Kembalikan ke Draf
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

