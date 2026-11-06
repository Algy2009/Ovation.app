"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useData } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { formatDate, formatIDR } from "@/lib/format";
import PublicHeader from "@/components/PublicHeader";
import RequireRole from "@/components/RequireRole";
import { ArrowLeft, ShieldCheck, RefreshCw, AlertCircle, Clock } from "lucide-react";
import QRCode from "qrcode";

function TicketDetailBody() {
  const { orderId } = useParams();
  const { getOrder, getEvent, requestRefund, loading } = useData();
  const { session } = useAuth();

  const [qrDataUrl, setQrDataUrl] = useState("");
  const [countdown, setCountdown] = useState(30);
  const [ticketDetails, setTicketDetails] = useState(null);
  const [ticketLoading, setTicketLoading] = useState(true);
  const [reason, setReason] = useState("");
  const [showRefundForm, setShowRefundForm] = useState(false);
  const [error, setError] = useState("");

  const order = getOrder(orderId);
  const event = order ? getEvent(order.eventId) : null;
  const category = event?.categories?.find((c) => c.id === order?.categoryId);

  // Fetch live ticket details & initial dynamic QR token
  useEffect(() => {
    fetch("/api/tickets")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const match = data.find((t) => t.orderNumber === orderId || t.id === orderId);
          if (match) {
            setTicketDetails(match);
            if (match.dynamicQrToken) {
              QRCode.toDataURL(match.dynamicQrToken, {
                width: 240,
                margin: 2,
                color: { dark: "#090A0F", light: "#FFFFFF" },
              }).then(setQrDataUrl);
            }
          }
        }
      })
      .catch((err) => console.error("Ticket fetch error:", err))
      .finally(() => setTicketLoading(false));
  }, [orderId]);

  // Dynamic rotating countdown timer (every second)
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          // Re-generate or re-fetch ticket token
          fetch("/api/tickets")
            .then((res) => res.json())
            .then((data) => {
              if (Array.isArray(data)) {
                const match = data.find((t) => t.orderNumber === orderId || t.id === orderId);
                if (match?.dynamicQrToken) {
                  setTicketDetails(match);
                  QRCode.toDataURL(match.dynamicQrToken, {
                    width: 240,
                    margin: 2,
                    color: { dark: "#090A0F", light: "#FFFFFF" },
                  }).then(setQrDataUrl);
                }
              }
            });
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [orderId]);

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

  if (loading || ticketLoading) {
    return (
      <div className="min-h-screen text-slate-100">
        <PublicHeader />
        <div className="py-20 text-center">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
          <p className="text-xs text-slate-400">Memuat e-ticket...</p>
        </div>
      </div>
    );
  }

  const displayEvent = ticketDetails?.event || event;
  const displayCategory = ticketDetails?.category || category;

  return (
    <div className="min-h-screen text-slate-100">
      <PublicHeader />

      <main className="mx-auto max-w-lg px-6 py-10">
        <Link
          href="/account/tickets"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 transition-colors hover:text-white"
        >
          <ArrowLeft size={14} /> Kembali ke Tiket Saya
        </Link>

        {/* E-Ticket Pass Card */}
        <div className="mt-5 overflow-hidden rounded-3xl border border-white/10 bg-[#12141F] shadow-2xl shadow-violet-950/40">
          {/* Header Pass */}
          <div className="relative border-b border-white/10 bg-gradient-to-br from-violet-950/60 via-[#1A1D2E] to-[#12141F] p-6 text-center">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-violet-500/20 border border-violet-500/30 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-violet-300">
              <ShieldCheck size={12} className="text-emerald-400" />
              E-Ticket Resmi Ovation
            </div>

            <h1 className="mt-3 text-2xl font-black text-white line-clamp-2">
              {displayEvent?.title || displayEvent?.name}
            </h1>

            <p className="mt-1 text-xs text-slate-400">
              {displayEvent?.venueName || displayEvent?.venue}, {displayEvent?.venueCity || displayEvent?.city}
            </p>
            <p className="text-xs font-semibold text-amber-400 mt-0.5">
              {formatDate(displayEvent?.startDatetime?.slice(0, 10) || displayEvent?.date)}
            </p>
          </div>

          {/* Dynamic QR Code Area */}
          <div className="flex flex-col items-center gap-4 p-8 bg-[#090A0F]/60">
            <div className="relative rounded-2xl bg-white p-3 shadow-xl">
              {qrDataUrl ? (
                <img src={qrDataUrl} alt="Dynamic QR Code" className="h-52 w-52 rounded-lg" />
              ) : (
                <div className="flex h-52 w-52 items-center justify-center bg-slate-100">
                  <RefreshCw className="animate-spin text-slate-400" size={32} />
                </div>
              )}
            </div>

            {/* Live Rotation Indicator */}
            <div className="flex flex-col items-center gap-1 text-center">
              <div className="flex items-center gap-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 px-3 py-1 text-[11px] font-medium text-amber-300">
                <Clock size={13} className="animate-pulse" />
                <span>Berotasi otomatis dalam <strong className="font-mono text-white">{countdown} detik</strong></span>
              </div>
              <p className="text-[10px] text-slate-400 max-w-xs mt-1">
                Screenshot tidak berlaku di gerbang masuk venue. Tunjukkan QR Code ini secara langsung dari aplikasi.
              </p>
            </div>
          </div>

          {/* Ticket Information Table */}
          <div className="space-y-2.5 border-t border-dashed border-white/10 p-6 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Kategori Tiket</span>
              <span className="font-bold text-amber-400">{displayCategory?.name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Kode Tiket</span>
              <span className="font-mono font-bold text-white">{ticketDetails?.ticketCode || "TKT-ONLINE"}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Atas Nama</span>
              <span className="font-semibold text-white">{ticketDetails?.attendeeName || session?.name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Nomor Pesanan</span>
              <span className="font-mono text-slate-300">{orderId}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Status Check-in</span>
              <span className={`font-semibold ${ticketDetails?.isCheckedIn ? "text-slate-400" : "text-emerald-400"}`}>
                {ticketDetails?.isCheckedIn ? "Sudah Digunakan" : "Valid & Belum Check-in"}
              </span>
            </div>
          </div>
        </div>

        {/* Refund CTA if eligible */}
        {order?.status === "paid" && !showRefundForm && (
          <button
            onClick={() => setShowRefundForm(true)}
            className="mt-6 w-full rounded-2xl border border-white/10 bg-white/5 py-3 text-xs font-semibold text-slate-300 transition-all hover:border-rose-500/40 hover:bg-rose-500/10 hover:text-rose-400"
          >
            Ajukan Pengembalian Dana (Refund)
          </button>
        )}

        {showRefundForm && (
          <form onSubmit={submitRefund} className="mt-6 space-y-4 rounded-2xl border border-white/10 bg-[#12141F] p-5">
            <h3 className="text-sm font-bold text-white">Formulir Pengajuan Refund</h3>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder="Jelaskan alasan pengajuan refund sesuai ketentuan promotor..."
              className="w-full rounded-xl border border-white/10 bg-black/40 p-3 text-xs text-white placeholder:text-slate-400 focus:border-violet-500 focus:outline-none"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="rounded-xl bg-violet-600 px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-violet-700"
              >
                Kirim Pengajuan
              </button>
              <button
                type="button"
                onClick={() => setShowRefundForm(false)}
                className="rounded-xl px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
              >
                Batal
              </button>
            </div>
            {error && <p className="text-xs text-rose-400">{error}</p>}
          </form>
        )}
      </main>
    </div>
  );
}

export default function TicketDetailPage() {
  return (
    <RequireRole roles={["customer", "admin", "super_admin"]}>
      <TicketDetailBody />
    </RequireRole>
  );
}
