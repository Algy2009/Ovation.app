"use client";

import { useState } from "react";
import Link from "next/link";
import { useData } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { formatDate, formatIDR } from "@/lib/format";
import PublicHeader from "@/components/PublicHeader";
import RequireRole from "@/components/RequireRole";
import EventCard from "@/components/EventCard";
import { Ticket } from "lucide-react";

const STATUS_LABEL = {
  paid: "Lunas",
  refund_requested: "Refund diajukan",
  refunded: "Refund selesai",
  blocked: "Diblokir",
};
const STATUS_STYLE = {
  paid: "bg-gold/15 text-gold",
  refund_requested: "bg-silver-dim/15 text-silver-dim",
  refunded: "bg-panel-raised text-silver",
  blocked: "bg-red/15 text-red",
};

function AccountBody() {
  const { session } = useAuth();
  const { getOrdersFor, getWishlistFor, getEvent, loading } = useData();
  const [tab, setTab] = useState("orders");

  if (loading) return null;

  const orders = getOrdersFor(session.email);
  const wishlist = getWishlistFor(session.email);

  return (
    <div className="min-h-screen bg-ink text-paper">
      <PublicHeader />
      <div className="mx-auto max-w-4xl px-6 py-8">
        <h1 className="font-display text-3xl tracking-tight text-paper">Akun saya</h1>
        <p className="mt-1 text-sm text-silver-dim">{session.name} · {session.email}</p>

        <div className="mt-6 flex gap-1 rounded-md border border-line bg-panel p-1 w-fit">
          {[
            { key: "orders", label: "Riwayat transaksi" },
            { key: "wishlist", label: "Wishlist" },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`rounded px-4 py-1.5 text-sm transition-colors ${
                tab === t.key ? "bg-panel-raised text-paper" : "text-silver-dim hover:text-silver"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "orders" && (
          <div className="mt-6 divide-y divide-line rounded-lg border border-line bg-panel">
            {orders.length === 0 && (
              <p className="px-5 py-8 text-center text-sm text-silver-dim">Belum ada transaksi.</p>
            )}
            {orders.map((o) => {
              const event = getEvent(o.eventId);
              return (
                <Link
                  key={o.id}
                  href={`/account/tickets/${o.id}`}
                  className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-panel-raised/60"
                >
                  <Ticket size={18} className="shrink-0 text-gold" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-paper">{event?.name}</p>
                    <p className="text-xs text-silver-dim">
                      {o.qty} tiket · {formatDate(event?.date)} · {formatIDR(o.total)}
                    </p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] ${STATUS_STYLE[o.status]}`}>
                    {STATUS_LABEL[o.status]}
                  </span>
                </Link>
              );
            })}
          </div>
        )}

        {tab === "wishlist" && (
          <div className="mt-6 grid grid-cols-2 gap-5 sm:grid-cols-3">
            {wishlist.length === 0 && (
              <p className="col-span-full py-8 text-center text-sm text-silver-dim">
                Belum ada event yang disimpan.
              </p>
            )}
            {wishlist.map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AccountPage() {
  return (
    <RequireRole roles={["customer"]}>
      <AccountBody />
    </RequireRole>
  );
}
