"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useData } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { formatDate, formatIDR } from "@/lib/format";
import PublicHeader from "@/components/PublicHeader";
import EventPoster from "@/components/EventPoster";
import { ArrowLeft, Heart, MapPin, CalendarDays, Users, Flame, ShieldCheck, Ticket } from "lucide-react";

export default function EventDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { getEvent, isWishlisted, toggleWishlist, loading } = useData();
  const { session } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen text-slate-100">
        <PublicHeader />
        <div className="py-20 text-center">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
          <p className="text-xs text-slate-400">Memuat detail event...</p>
        </div>
      </div>
    );
  }

  const event = getEvent(id);
  if (!event || event.status !== "published") {
    return (
      <div className="min-h-screen text-slate-100">
        <PublicHeader />
        <div className="mx-auto max-w-6xl px-6 py-20 text-center">
          <h2 className="text-xl font-bold text-white">Event Tidak Ditemukan</h2>
          <p className="mt-1 text-xs text-slate-400">Konser yang kamu cari mungkin belum dipublikasikan atau sudah berakhir.</p>
          <Link
            href="/"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-violet-700"
          >
            ← Kembali ke Katalog
          </Link>
        </div>
      </div>
    );
  }

  const wished = session?.role === "customer" && isWishlisted(session.email, event.id);

  function handleWishlist() {
    if (!session || session.role !== "customer") {
      router.push(`/login?next=${encodeURIComponent(`/events/${event.id}`)}`);
      return;
    }
    toggleWishlist(session.email, event.id).catch(() => {});
  }

  function handleBuy(categoryId) {
    if (!session || session.role !== "customer") {
      router.push(`/login?next=${encodeURIComponent(`/events/${event.id}/checkout?category=${categoryId}`)}`);
      return;
    }
    const target = `/events/${event.id}/checkout?category=${categoryId}`;
    router.push(event.highDemand ? `/events/${event.id}/queue?next=${encodeURIComponent(target)}` : target);
  }

  return (
    <div className="min-h-screen text-slate-100">
      <PublicHeader />

      <main className="mx-auto max-w-7xl px-6 py-10">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 transition-colors hover:text-white mb-6"
        >
          <ArrowLeft size={14} /> Kembali ke Jelajah Konser
        </Link>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_420px]">
          {/* Left Column: Poster & Detailed Description */}
          <div>
            <div className="relative aspect-[16/9] w-full overflow-hidden rounded-3xl border border-white/10 bg-slate-900 shadow-2xl">
              <EventPoster event={event} className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

              <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
                <div>
                  <div className="flex gap-2 mb-2">
                    {event.highDemand && (
                      <span className="flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-lg shadow-amber-500/30">
                        <Flame size={12} className="animate-pulse" />
                        War Ticket Enabled
                      </span>
                    )}
                    <span className="rounded-full bg-black/60 border border-white/20 px-3 py-1 text-[10px] font-semibold text-slate-200 backdrop-blur-md">
                      {event.genre}
                    </span>
                  </div>
                  <h1 className="text-3xl font-black text-white sm:text-4xl">{event.name || event.title}</h1>
                </div>

                <button
                  onClick={handleWishlist}
                  className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/20 bg-black/60 backdrop-blur-md text-white transition-all hover:scale-105 hover:bg-black/90"
                  aria-label="Wishlist"
                >
                  <Heart size={18} className={wished ? "fill-rose-500 text-rose-500" : "text-white"} />
                </button>
              </div>
            </div>

            {/* Quick Metadata Info */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="glass-panel flex items-center gap-3 rounded-2xl border border-white/5 bg-[#12141F] p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">
                  <MapPin size={20} />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-slate-400">Lokasi Venue</p>
                  <p className="text-xs font-bold text-white truncate">{event.venue}, {event.city}</p>
                </div>
              </div>

              <div className="glass-panel flex items-center gap-3 rounded-2xl border border-white/5 bg-[#12141F] p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
                  <CalendarDays size={20} />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-slate-400">Tanggal & Waktu</p>
                  <p className="text-xs font-bold text-white">{formatDate(event.date)}{event.time ? ` • ${event.time}` : ""}</p>
                </div>
              </div>

              <div className="glass-panel flex items-center gap-3 rounded-2xl border border-white/5 bg-[#12141F] p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                  <Users size={20} />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-slate-400">Limit Checkout</p>
                  <p className="text-xs font-bold text-white">Maks. {event.purchaseLimit || 4} tiket / akun</p>
                </div>
              </div>
            </div>

            {/* Description & Terms */}
            <div className="mt-8 space-y-6">
              <div className="glass-panel rounded-3xl border border-white/10 bg-[#12141F] p-6">
                <h3 className="text-base font-bold text-white mb-3">Deskripsi Konser</h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                  {event.description || "Informasi lengkap mengenai jadwal dan susunan penampil akan diperbarui oleh promotor resmi."}
                </p>
              </div>

              <div className="glass-panel rounded-3xl border border-white/10 bg-[#12141F] p-6">
                <h3 className="text-base font-bold text-white mb-3">Ketentuan & Syarat Masuk</h3>
                <ul className="list-disc list-inside space-y-1.5 text-xs text-slate-400">
                  <li>Wajib membawa identitas asli (KTP/SIM/Paspor) sesuai data yang tertera pada e-ticket.</li>
                  <li>Dynamic QR Code berotasi setiap 30 detik untuk menjamin keaslian tiket. Screenshot tidak berlaku.</li>
                  <li>Anak di bawah usia 12 tahun wajib didampingi orang tua atau wali yang memiliki tiket resmi.</li>
                  <li>Dilarang membawa senjata tajam, kamera profesional, dan makanan/minuman dari luar venue.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Right Column: Ticket Category Tiers */}
          <div>
            <div className="glass-panel sticky top-24 rounded-3xl border border-white/10 bg-[#12141F] p-6 shadow-2xl shadow-violet-950/40">
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div>
                  <h3 className="text-base font-bold text-white">Pilih Kategori Tiket</h3>
                  <p className="text-[11px] text-slate-400">Pilih tier tempat duduk atau festival favoritmu</p>
                </div>
                <Ticket size={20} className="text-amber-400" />
              </div>

              {event.highDemand && (
                <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-[11px] text-amber-300">
                  ⚡ <strong>Ticket War Aktif:</strong> Kamu akan diarahkan ke antrean virtual jika permintaan tinggi.
                </div>
              )}

              <div className="mt-5 space-y-3.5">
                {event.categories?.map((c) => {
                  const remaining = (c.remainingQuota !== undefined ? c.remainingQuota : c.quota - c.sold);
                  const soldOut = remaining <= 0;

                  return (
                    <div
                      key={c.id}
                      className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 transition-all hover:border-violet-500/40 hover:bg-white/[0.04]"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-bold text-sm text-white">{c.name}</h4>
                          <span className="text-[10px] text-slate-400">
                            {c.isStanding ? "Standing Festival" : "Numbered Seating"}
                          </span>
                        </div>
                        <span className="text-base font-black text-amber-400">
                          {formatIDR(c.price)}
                        </span>
                      </div>

                      <div className="mt-3 flex items-center justify-between text-xs">
                        <span className={`text-[11px] font-semibold ${soldOut ? "text-rose-400" : "text-emerald-400"}`}>
                          {soldOut ? "Habis Terjual" : `Tersisa ${remaining.toLocaleString("id-ID")} tiket`}
                        </span>

                        <button
                          disabled={soldOut}
                          onClick={() => handleBuy(c.id)}
                          className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-violet-600/20 transition-all hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          {soldOut ? "Sold Out" : "Beli Tiket"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 flex items-center justify-center gap-1.5 text-[10px] text-slate-400 text-center border-t border-white/5 pt-4">
                <ShieldCheck size={14} className="text-emerald-400" />
                <span>Garansi Tiket Resmi 100% Anti-Calo</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
