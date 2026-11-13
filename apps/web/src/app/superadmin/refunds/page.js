"use client";

import { useData } from "@/lib/store";
import { formatIDR } from "@/lib/format";
import { Check, X, Building2, User, CreditCard } from "lucide-react";

const STATUS_STYLE = {
  requested: "bg-gold/15 text-gold border border-gold/30",
  organizer_approved: "bg-amber-500/20 text-amber-300 border border-amber-500/30",
  superadmin_approved: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
  completed: "bg-panel-raised text-silver",
  rejected: "bg-red/15 text-red border border-red/30",
  failed: "bg-red/15 text-red border border-red/30",
};

const STATUS_LABEL = {
  requested: "Menunggu Promotor",
  organizer_approved: "Menunggu Super Admin",
  superadmin_approved: "Disetujui Super Admin",
  completed: "Selesai",
  rejected: "Ditolak",
  failed: "Gagal",
};

export default function RefundsPage() {
  const { refundRequests, orders, events, approveRefund, rejectRefund, loading } = useData();

  if (loading) return <p className="text-silver-dim">Memuat data…</p>;

  // Pending for Super Admin includes both requested and organizer_approved
  const pending = refundRequests.filter(
    (r) => r.status === "pending" || r.status === "requested" || r.status === "organizer_approved"
  );
  const decided = refundRequests.filter(
    (r) => r.status !== "pending" && r.status !== "requested" && r.status !== "organizer_approved"
  );

  function eventNameFor(orderId) {
    const order = orders.find((o) => o.id === orderId);
    const event = events.find((e) => e.id === order?.eventId);
    return { order, event };
  }

  return (
    <div>
      <h1 className="font-display text-3xl tracking-tight text-paper">Refund & komplain</h1>
      <p className="mt-1 text-sm text-silver-dim">Tinjau dan setujui pengembalian dana tiket dari pembeli.</p>

      <h2 className="mt-8 font-display text-lg tracking-tight text-paper">Menunggu keputusan ({pending.length})</h2>
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
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-paper">
                      {order?.buyerName || r.userName} · {event?.name || r.eventName}
                    </p>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${STATUS_STYLE[r.status] || "bg-white/10 text-white"}`}>
                      {STATUS_LABEL[r.status] || r.status}
                    </span>
                  </div>
                  <p className="text-xs text-silver-dim mt-0.5">
                    Pesanan: <span className="font-mono text-paper">{r.orderNumber || order?.orderNumber}</span> · Total: {formatIDR(r.refundAmount || (order?.total ?? 0))}
                  </p>
                  
                  {/* Bank Details */}
                  {r.bankAccountNumber && (
                    <div className="mt-2 flex items-center gap-2 text-xs text-silver bg-black/30 px-3 py-1.5 rounded-md border border-white/5 w-fit">
                      <Building2 size={13} className="text-gold" />
                      <span>{r.bankName} — <strong>{r.bankAccountNumber}</strong> (a.n {r.bankAccountHolder})</span>
                    </div>
                  )}

                  <p className="mt-2 max-w-lg text-sm text-silver bg-panel-raised/50 p-2.5 rounded border border-line">
                    &ldquo;{r.reason}&rdquo;
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button
                    onClick={() => approveRefund(r.id).catch((err) => alert(err.message))}
                    className="flex items-center gap-1.5 rounded-md bg-gold px-3 py-2 text-sm font-medium text-ink hover:opacity-90 transition-opacity"
                  >
                    <Check size={14} /> Setujui Refund
                  </button>
                  <button
                    onClick={() => rejectRefund(r.id).catch((err) => alert(err.message))}
                    className="flex items-center gap-1.5 rounded-md border border-line px-3 py-2 text-sm text-silver-dim hover:border-red hover:text-red transition-colors"
                  >
                    <X size={14} /> Tolak
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <h2 className="mt-10 font-display text-lg tracking-tight text-paper">Riwayat Keputusan ({decided.length})</h2>
      <div className="mt-3 divide-y divide-line rounded-lg border border-line bg-panel">
        {decided.length === 0 && <p className="px-5 py-4 text-sm text-silver-dim">Belum ada riwayat.</p>}
        {decided.map((r) => {
          const { order, event } = eventNameFor(r.orderId);
          return (
            <div key={r.id} className="flex items-center justify-between px-5 py-3.5">
              <div>
                <p className="text-sm text-paper">{order?.buyerName || r.userName} · {event?.name || r.eventName}</p>
                <p className="text-xs text-silver-dim">
                  {formatIDR(r.refundAmount || (order?.total ?? 0))} · {r.bankName ? `${r.bankName} - ${r.bankAccountNumber}` : "Rekening Pengguna"}
                </p>
              </div>
              <span className={`rounded-full px-2 py-0.5 text-[11px] ${STATUS_STYLE[r.status] || "bg-panel-raised text-silver"}`}>
                {STATUS_LABEL[r.status] || r.status}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
