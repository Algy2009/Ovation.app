"use client";

import { useData } from "@/lib/store";
import { formatIDR } from "@/lib/format";
import { ShieldAlert, Ban, CheckCircle2 } from "lucide-react";

function timeAgo(iso) {
  return new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }).format(
    new Date(iso)
  );
}

export default function FraudPage() {
  const { orders, events, blockOrder, clearFlag, loading } = useData();

  if (loading) return <p className="text-silver-dim">Memuat data…</p>;

  const flagged = orders.filter((o) => o.flagged);

  return (
    <div>
      <h1 className="font-display text-3xl tracking-tight text-paper">Anti calo & fraud</h1>
      <p className="mt-1 text-sm text-silver-dim">
        Transaksi dengan pola pembelian tidak wajar ditandai otomatis untuk ditinjau.
      </p>

      <div className="mt-8 space-y-3">
        {flagged.length === 0 && (
          <p className="rounded-lg border border-dashed border-line px-5 py-6 text-center text-sm text-silver-dim">
            Tidak ada transaksi yang ditandai saat ini.
          </p>
        )}
        {flagged.map((o) => {
          const event = events.find((e) => e.id === o.eventId);
          return (
            <div key={o.id} className="rounded-lg border border-line bg-panel px-5 py-4">
              <div className="flex items-start justify-between gap-6">
                <div className="flex gap-3">
                  <ShieldAlert size={18} className="mt-0.5 shrink-0 text-red" />
                  <div>
                    <p className="text-sm font-medium text-paper">
                      {o.buyerName} · {o.qty} tiket · {event?.name}
                    </p>
                    <p className="mt-0.5 text-xs text-silver-dim">{o.buyerEmail} · {timeAgo(o.createdAt)}</p>
                    <p className="mt-2 max-w-lg text-sm text-silver">{o.flagReason}</p>
                    <p className="mt-1 text-xs text-silver-dim">Nilai transaksi: {formatIDR(o.total)}</p>
                  </div>
                </div>

                <div className="flex shrink-0 flex-col items-end gap-2">
                  {o.status === "blocked" ? (
                    <span className="rounded-full bg-red/15 px-2 py-0.5 text-[11px] text-red">Diblokir</span>
                  ) : (
                    <>
                      <button
                        onClick={() => blockOrder(o.id).catch((err) => alert(err.message))}
                        className="flex items-center gap-1.5 rounded-md border border-red/40 px-3 py-1.5 text-xs text-red hover:bg-red/10"
                      >
                        <Ban size={13} /> Blokir transaksi
                      </button>
                      <button
                        onClick={() => clearFlag(o.id).catch((err) => alert(err.message))}
                        className="flex items-center gap-1.5 text-xs text-silver-dim hover:text-gold"
                      >
                        <CheckCircle2 size={13} /> Ini transaksi wajar
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
