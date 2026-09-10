"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useData } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { formatDate, formatIDR } from "@/lib/format";
import PublicHeader from "@/components/PublicHeader";
import EventPoster from "@/components/EventPoster";
import { ArrowLeft, Heart, MapPin, CalendarDays, Users } from "lucide-react";

export default function EventDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { getEvent, isWishlisted, toggleWishlist, loading } = useData();
  const { session } = useAuth();

  if (loading) return <p className="p-10 text-silver-dim">Memuat data…</p>;

  const event = getEvent(id);
  if (!event || event.status !== "published") {
    return (
      <div className="min-h-screen bg-ink text-paper">
        <PublicHeader />
        <div className="mx-auto max-w-6xl px-6 py-16 text-center">
          <p className="text-silver-dim">Event tidak ditemukan.</p>
          <Link href="/" className="mt-2 inline-block text-sm text-gold">Kembali ke beranda</Link>
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
    <div className="min-h-screen bg-ink text-paper">
      <PublicHeader />

      <div className="mx-auto max-w-6xl px-6 py-8">
        <Link href="/" className="flex items-center gap-1 text-sm text-silver-dim hover:text-silver">
          <ArrowLeft size={14} /> Cari event lain
        </Link>

        <div className="mt-5 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_380px]">
          <div>
            <EventPoster event={event} className="aspect-[16/9] w-full rounded-lg border border-line" />

            <div className="mt-6 flex items-start justify-between gap-4">
              <div>
                <span className="rounded-full bg-gold/15 px-2 py-0.5 text-[11px] text-gold">{event.genre}</span>
                <h1 className="mt-3 font-display text-3xl tracking-tight text-paper sm:text-4xl">{event.name}</h1>
              </div>
              <button
                onClick={handleWishlist}
                className="flex shrink-0 items-center gap-1.5 rounded-md border border-line px-3 py-2 text-sm text-silver hover:border-gold hover:text-gold"
              >
                <Heart size={15} className={wished ? "fill-gold text-gold" : ""} />
                {wished ? "Tersimpan" : "Simpan"}
              </button>
            </div>

            <div className="mt-4 space-y-2 text-sm text-silver">
              <p className="flex items-center gap-2">
                <MapPin size={15} className="text-silver-dim" /> {event.venue}, {event.city}
              </p>
              <p className="flex items-center gap-2">
                <CalendarDays size={15} className="text-silver-dim" /> {formatDate(event.date)}
                {event.time ? `, ${event.time}` : ""}
              </p>
              <p className="flex items-center gap-2">
                <Users size={15} className="text-silver-dim" /> Maks. {event.purchaseLimit} tiket per transaksi
              </p>
            </div>

            {event.description && <p className="mt-5 max-w-xl text-sm text-silver">{event.description}</p>}
          </div>

          <div className="h-fit rounded-lg border border-line bg-panel p-5">
            <p className="font-display text-lg tracking-tight text-paper">Pilih kategori tiket</p>
            {event.highDemand && (
              <p className="mt-1 text-xs text-gold">Event ini menggunakan antrian virtual saat checkout.</p>
            )}
            <div className="mt-4 space-y-3">
              {event.categories.map((c) => {
                const remaining = c.quota - c.sold;
                const soldOut = remaining <= 0;
                return (
                  <div key={c.id} className="rounded-md border border-line px-4 py-3.5">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-paper">{c.name}</p>
                      <p className="text-sm text-gold">{formatIDR(c.price)}</p>
                    </div>
                    <p className="mt-1 text-xs text-silver-dim">
                      {soldOut ? "Habis terjual" : `Tersisa ${remaining.toLocaleString("id-ID")} tiket`}
                    </p>
                    <button
                      disabled={soldOut}
                      onClick={() => handleBuy(c.id)}
                      className="mt-3 w-full rounded-md bg-gold py-2 text-sm font-medium text-ink transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:bg-panel-raised disabled:text-silver-dim"
                    >
                      {soldOut ? "Tiket habis" : "Beli tiket"}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
