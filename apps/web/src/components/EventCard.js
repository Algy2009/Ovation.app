"use client";

import Link from "next/link";
import { Heart, Flame, MapPin, Calendar } from "lucide-react";
import EventPoster from "./EventPoster";
import { formatDate, formatIDR } from "@/lib/format";
import { useAuth } from "@/lib/auth";
import { useData } from "@/lib/store";

export default function EventCard({ event }) {
  const { session } = useAuth();
  const { isWishlisted, toggleWishlist } = useData();

  const lowestPrice = event.categories?.reduce(
    (min, c) => (c.price < min ? c.price : min),
    event.categories?.[0]?.price ?? 0
  ) ?? 0;

  const soldOut = event.categories?.length > 0 && event.categories.every((c) => c.sold >= c.quota);
  const wished = session?.role === "customer" && isWishlisted(session.email, event.id);

  return (
    <div className="glass-card group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#12141F]">
      {/* Event Banner */}
      <Link href={`/events/${event.id}`} className="relative aspect-[16/10] w-full overflow-hidden bg-slate-900">
        <EventPoster event={event} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#12141F] via-transparent to-black/30" />

        {/* Badges */}
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {event.highDemand && (
            <span className="flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-md shadow-amber-500/30">
              <Flame size={12} className="animate-pulse" />
              War Ticket
            </span>
          )}
          {event.genre && (
            <span className="rounded-full border border-white/20 bg-black/50 px-2.5 py-1 text-[10px] font-medium text-slate-200 backdrop-blur-md">
              {event.genre}
            </span>
          )}
        </div>
      </Link>

      {/* Wishlist Button */}
      {session?.role === "customer" && (
        <button
          onClick={(e) => {
            e.preventDefault();
            toggleWishlist(session.email, event.id).catch(() => {});
          }}
          aria-label="Simpan ke wishlist"
          className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-black/60 backdrop-blur-md transition-all hover:scale-110 hover:bg-black/90"
        >
          <Heart size={14} className={wished ? "fill-rose-500 text-rose-500" : "text-white"} />
        </button>
      )}

      {/* Event Details */}
      <div className="flex flex-1 flex-col p-4">
        <Link href={`/events/${event.id}`} className="group-hover:text-amber-400 transition-colors">
          <h3 className="line-clamp-1 text-base font-bold text-white tracking-tight">
            {event.name || event.title}
          </h3>
        </Link>

        <div className="mt-2 space-y-1 text-xs text-slate-400">
          <p className="flex items-center gap-1.5 truncate">
            <MapPin size={13} className="shrink-0 text-violet-400" />
            <span className="truncate">{event.venue}, {event.city}</span>
          </p>
          <p className="flex items-center gap-1.5 truncate">
            <Calendar size={13} className="shrink-0 text-amber-400" />
            <span>{formatDate(event.date)}</span>
          </p>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-slate-400">Mulai Dari</span>
            {soldOut ? (
              <p className="text-sm font-bold text-rose-400">Habis Terjual</p>
            ) : (
              <p className="text-sm font-black text-amber-400">
                {formatIDR(lowestPrice)}
              </p>
            )}
          </div>

          <Link
            href={`/events/${event.id}`}
            className="rounded-xl bg-violet-600/30 border border-violet-500/40 px-3.5 py-1.5 text-xs font-semibold text-violet-200 transition-all hover:bg-violet-600 hover:text-white"
          >
            Beli Tiket
          </Link>
        </div>
      </div>
    </div>
  );
}
