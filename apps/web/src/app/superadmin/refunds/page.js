"use client";

import { useData } from "@/lib/store";
import { formatIDR } from "@/lib/format";
import { Check, X } from "lucide-react";

const STATUS_STYLE = {
  pending: "bg-gold/15 text-gold",
  approved: "bg-panel-raised text-silver",
  rejected: "bg-red/15 text-red",
};
const STATUS_LABEL = { pending: "Menunggu", approved: "Disetujui", rejected: "Ditolak" };

export default function RefundsPage() {
  const { refundRequests, orders, events, approveRefund, rejectRefund, loading } = useData();

  if (loading) return <p className="text-silver-dim">Memuat data…</p>;

  const pending = refundRequests.filter((r) => r.status === "pending");
  const decided = refundRequests.filter((r) => r.status !== "pending");

  function eventNameFor(orderId) {
    const order = orders.find((o) => o.id === orderId);
    const event = events.find((e) => e.id === order?.eventId);
    return { order, event };
  }

  return (
    <div>
      <h1 className="font-display text-3xl tracking-tight text-paper">Refund & komplain</h1>
      <p className="mt-1 text-sm text-silver-dim">Tinjau permintaan pengembalian dana dari pembeli.</p>

      <h2 className="mt-8 font-display text-lg tracking-tight text-paper">Menunggu keputusan</h2>
      <div className="mt-3 space-y-3">
        {pending.length === 0 && (
          <p className="rounded-lg border border-dashed border-line px-5 py-6 text-center text-sm text-silver-dim">
            Tidak ada permintaan refund yang menunggu.
          </p>
        )}
        {pending.map((r) => {
          const { order, event } = eventNameFor(r.orderId);
          return (
            <div key={r.id} className="rounded-md border border-line bg-panel px-5 py-4">
              <div className="flex items-start justify-between gap-6">
                <div>
                  <p className="text-sm font-medium text-paper">
                    {order?.buyerName} · {event?.name}
                  </p>
                  <p className="text-xs text-silver-dim">
                    {order?.qty} tiket · {formatIDR(order?.total ?? 0)} · Pesanan {order?.id}
                  </p>
                  <p className="mt-2 max-w-lg text-sm text-silver">&ldquo;{r.reason}&rdquo;</p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button
                    onClick={() => approveRefund(r.id).catch((err) => alert(err.message))}
                    className="flex items-center gap-1.5 rounded-md bg-gold px-3 py-2 text-sm font-medium text-ink hover:opacity-90"
                  >
                    <Check size={14} /> Setujui
                  </button>
                  <button
                    onClick={() => rejectRefund(r.id).catch((err) => alert(err.message))}
                    className="flex items-center gap-1.5 rounded-md border border-line px-3 py-2 text-sm text-silver-dim hover:border-red hover:text-red"
                  >
                    <X size={14} /> Tolak
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <h2 className="mt-10 font-display text-lg tracking-tight text-paper">Riwayat</h2>
      <div className="mt-3 divide-y divide-line rounded-lg border border-line bg-panel">
        {decided.length === 0 && <p className="px-5 py-4 text-sm text-silver-dim">Belum ada riwayat.</p>}
        {decided.map((r) => {
          const { order, event } = eventNameFor(r.orderId);
          return (
            <div key={r.id} className="flex items-center justify-between px-5 py-3.5">
              <div>
                <p className="text-sm text-paper">{order?.buyerName} · {event?.name}</p>
                <p className="text-xs text-silver-dim">{formatIDR(order?.total ?? 0)}</p>
              </div>
              <span className={`rounded-full px-2 py-0.5 text-[11px] ${STATUS_STYLE[r.status]}`}>
                {STATUS_LABEL[r.status]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
