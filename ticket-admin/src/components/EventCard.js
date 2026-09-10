"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import EventPoster from "./EventPoster";
import { formatDate, formatIDR } from "@/lib/format";
import { useAuth } from "@/lib/auth";
import { useData } from "@/lib/store";

export default function EventCard({ event }) {
  const { session } = useAuth();
  const { isWishlisted, toggleWishlist } = useData();
  const lowestPrice = event.categories.reduce(
    (min, c) => (c.price < min ? c.price : min),
    event.categories[0]?.price ?? 0
  );
  const soldOut = event.categories.length > 0 && event.categories.every((c) => c.sold >= c.quota);
  const wished = session?.role === "customer" && isWishlisted(session.email, event.id);

  return (
    <div className="group relative overflow-hidden rounded-lg border border-line bg-panel">
      <Link href={`/events/${event.id}`}>
        <EventPoster event={event} className="aspect-[16/9] w-full" />
      </Link>

      {session?.role === "customer" && (
        <button
          onClick={(e) => {
            e.preventDefault();
            toggleWishlist(session.email, event.id).catch(() => {});
          }}
          aria-label="Simpan ke wishlist"
          className="absolute right-2.5 top-2.5 rounded-full bg-ink/70 p-2 backdrop-blur-sm transition-colors hover:bg-ink"
        >
          <Heart size={14} className={wished ? "fill-gold text-gold" : "text-paper"} />
        </button>
      )}

      <Link href={`/events/${event.id}`} className="block px-4 py-3.5">
        <p className="truncate text-sm font-medium text-paper">{event.name}</p>
        <p className="mt-0.5 truncate text-xs text-silver-dim">
          {event.venue}, {event.city}
        </p>
        <div className="mt-2 flex items-center justify-between">
          <p className="text-xs text-silver-dim">{formatDate(event.date)}</p>
          {soldOut ? (
            <span className="text-xs text-red">Habis</span>
          ) : (
            <p className="text-sm text-gold">mulai {formatIDR(lowestPrice)}</p>
          )}
        </div>
      </Link>
    </div>
  );
}
