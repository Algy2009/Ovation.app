"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useData } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { formatDate, formatIDR } from "@/lib/format";
import PublicHeader from "@/components/PublicHeader";
import RequireRole from "@/components/RequireRole";
import { ArrowLeft, QrCode } from "lucide-react";

function TicketBody() {
  const { orderId } = useParams();
  const router = useRouter();
  const { getOrder, getEvent, requestRefund, loading } = useData();
  const { session } = useAuth();
  const [reason, setReason] = useState("");
  const [showRefundForm, setShowRefundForm] = useState(false);
  const [error, setError] = useState("");

  if (loading) {
    return (
      <div className="min-h-screen bg-ink text-paper">
        <PublicHeader />
        <p className="p-10 text-center text-silver-dim">Memuat data…</p>
      </div>
    );
  }

  const order = getOrder(orderId);
  if (!order || order.buyerEmail !== session.email) {
    return (
      <div className="min-h-screen bg-ink text-paper">
        <PublicHeader />
        <p className="p-10 text-center text-silver-dim">Tiket tidak ditemukan.</p>
      </div>
    );
  }
  const event = getEvent(order.eventId);
  const category = event?.categories.find((c) => c.id === order.categoryId);

  async function submitRefund(e) {
    e.preventDefault();
    if (!reason.trim()) return;
    try {
      await requestRefund(order.id, reason.trim());
      setShowRefundForm(false);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="min-h-screen bg-ink text-paper">
      <PublicHeader />
      <div className="mx-auto max-w-md px-6 py-8">
        <Link href="/account" className="flex items-center gap-1 text-sm text-silver-dim hover:text-silver">
          <ArrowLeft size={14} /> Riwayat transaksi
        </Link>

        <div className="mt-5 overflow-hidden rounded-lg border border-line bg-panel">
          <div className="border-b border-dashed border-line p-6 text-center">
            <p className="text-xs uppercase tracking-wide text-silver-dim">E-Tiket</p>
            <h1 className="mt-1 font-display text-2xl tracking-tight text-paper">{event?.name}</h1>
            <p className="mt-1 text-sm text-silver-dim">
              {event?.venue}, {event?.city}
            </p>
            <p className="text-sm text-silver-dim">{formatDate(event?.date)}{event?.time ? `, ${event.time}` : ""}</p>
          </div>

          <div className="flex flex-col items-center gap-4 p-6">
            <div className="flex h-40 w-40 items-center justify-center rounded-md bg-paper">
              <QrCode size={110} className="text-ink" />
            </div>
            <p className="text-xs text-silver-dim">Tunjukkan kode ini di pintu masuk venue</p>
          </div>

          <div className="space-y-2 border-t border-dashed border-line p-6 text-sm">
            <Row label="Kategori" value={category?.name} />
            <Row label="Jumlah" value={`${order.qty} tiket`} />
            <Row label="Total bayar" value={formatIDR(order.total)} />
            <Row label="Kode pesanan" value={order.id} />
            <Row label="Atas nama" value={order.buyerName} />
          </div>
        </div>

        {order.status === "paid" && !showRefundForm && (
          <button
            onClick={() => setShowRefundForm(true)}
            className="mt-4 w-full rounded-md border border-line px-4 py-2.5 text-sm text-silver hover:border-red hover:text-red"
          >
            Ajukan refund
          </button>
        )}

        {order.status === "refund_requested" && (
          <p className="mt-4 rounded-md border border-line bg-panel px-4 py-3 text-sm text-silver-dim">
            Permintaan refund kamu sedang ditinjau tim kami.
          </p>
        )}
        {order.status === "refunded" && (
          <p className="mt-4 rounded-md border border-line bg-panel px-4 py-3 text-sm text-gold">
            Refund untuk pesanan ini sudah selesai diproses.
          </p>
        )}

        {showRefundForm && (
          <form onSubmit={submitRefund} className="mt-4 space-y-3 rounded-md border border-line bg-panel p-4">
            <label className="block">
              <span className="mb-1.5 block text-sm text-silver">Alasan refund</span>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                placeholder="Ceritakan alasan kamu mengajukan refund"
                className="w-full rounded-md border border-line bg-panel-raised px-3 py-2 text-sm text-paper placeholder:text-silver-dim focus:border-gold focus:outline-none"
              />
            </label>
            <div className="flex gap-2">
              <button type="submit" className="rounded-md bg-gold px-4 py-2 text-sm font-medium text-ink hover:opacity-90">
                Kirim permintaan
              </button>
              <button type="button" onClick={() => setShowRefundForm(false)} className="text-sm text-silver-dim hover:text-silver">
                Batal
              </button>
            </div>
            {error && <p className="text-sm text-red">{error}</p>}
          </form>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-silver-dim">{label}</span>
      <span className="text-paper">{value}</span>
    </div>
  );
}

export default function TicketPage() {
  return (
    <RequireRole roles={["customer"]}>
      <TicketBody />
    </RequireRole>
  );
}
