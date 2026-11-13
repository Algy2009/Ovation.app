"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import PublicHeader from "@/components/PublicHeader";
import RequireRole from "@/components/RequireRole";
import { useAuth } from "@/lib/auth";
import { formatDate, formatIDR } from "@/lib/format";
import {
  ArrowLeft,
  ShieldCheck,
  CreditCard,
  QrCode,
  Building2,
  Wallet,
  Clock,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  Copy,
  Sparkles,
} from "lucide-react";
import QRCode from "qrcode";

const PAYMENT_METHODS = [
  { id: "QRIS", name: "QRIS (GoPay, OVO, Dana, BCA, Semua Bank)", icon: QrCode, category: "Instant QR" },
  { id: "BCA_VA", name: "BCA Virtual Account", icon: Building2, category: "Virtual Account" },
  { id: "MANDIRI_VA", name: "Mandiri Virtual Account", icon: Building2, category: "Virtual Account" },
  { id: "BNI_VA", name: "BNI Virtual Account", icon: Building2, category: "Virtual Account" },
  { id: "GOPAY", name: "GoPay / E-Wallet", icon: Wallet, category: "E-Wallet" },
  { id: "CREDIT_CARD", name: "Kartu Kredit / Debit Visa & Mastercard", icon: CreditCard, category: "Card" },
];

function CheckoutBody() {
  const { id } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryIdParam = searchParams.get("category");
  const queueTokenParam = searchParams.get("token");
  const { session } = useAuth();

  const [event, setEvent] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [qty, setQty] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("QRIS");
  const [attendeeName, setAttendeeName] = useState("");
  const [attendeeEmail, setAttendeeEmail] = useState("");
  const [attendeePhone, setAttendeePhone] = useState("");
  const [attendeeNik, setAttendeeNik] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [paymentModal, setPaymentModal] = useState(null);
  const [paymentQrDataUrl, setPaymentQrDataUrl] = useState("");
  const [simulating, setSimulating] = useState(false);
  const [copied, setCopied] = useState(false);

  // 15-minute holding timer
  const [timeLeft, setTimeLeft] = useState(900);

  useEffect(() => {
    if (session) {
      setAttendeeName(session.name || "");
      setAttendeeEmail(session.email || "");
      setAttendeePhone("081311223344");
      setAttendeeNik("3171012304900001");
    }
  }, [session]);

  useEffect(() => {
    fetch(`/api/events/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.id) {
          setEvent(data);
          const matched = data.categories?.find((c) => c.id === categoryIdParam) || data.categories?.[0];
          setSelectedCategory(matched);
        }
      })
      .catch((err) => console.error("Event fetch error:", err))
      .finally(() => setLoading(false));
  }, [id, categoryIdParam]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const unitPrice = selectedCategory ? Number(selectedCategory.price) : 0;
  const subtotal = unitPrice * qty;
  const platformFee = Math.round(subtotal * 0.05);
  const adminFee = 5000;
  const finalAmount = subtotal + platformFee + adminFee;

  async function handleCheckout(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: event.id,
          categoryId: selectedCategory.id,
          qty,
          paymentMethod,
          queueToken: queueTokenParam,
          attendees: [
            {
              name: attendeeName,
              email: attendeeEmail,
              phone: attendeePhone,
              nik: attendeeNik,
            },
          ],
        }),
      });

      const orderData = await res.json();
      if (!res.ok) {
        throw new Error(orderData.error || "Gagal memproses pesanan tiket.");
      }

      // Initiate payment via Midtrans gateway
      const payRes = await fetch("/api/payments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: orderData.id,
          provider: "MIDTRANS",
          channel: paymentMethod.includes("VA") ? "VIRTUAL_ACCOUNT" : paymentMethod === "CREDIT_CARD" ? "CREDIT_CARD" : "QRIS",
          methodDetail: paymentMethod,
        }),
      });

      const payJson = await payRes.json().catch(() => ({}));
      const paymentInfo = payJson.payment || {
        provider: "MIDTRANS",
        channel: paymentMethod,
        vaNumber: "8271081311223344",
        qrString: "00020101021226670016ID.CO.OVATION.WWW0118936009990000010002021500000192835204581253033605802ID5914OVATION TICKETS6007JAKARTA62070703A0163046B2F",
        amount: finalAmount,
      };

      if (paymentInfo.qrString) {
        try {
          const dataUrl = await QRCode.toDataURL(paymentInfo.qrString, { width: 220, margin: 1 });
          setPaymentQrDataUrl(dataUrl);
        } catch {}
      }

      setPaymentModal({ order: orderData, payment: paymentInfo });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSimulatePayment() {
    if (!paymentModal?.order) return;
    setSimulating(true);
    try {
      await fetch("/api/payments/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: paymentModal.payment?.provider || "MIDTRANS",
          orderNumber: paymentModal.order.orderNumber,
          action: "SETTLEMENT",
        }),
      });

      // Redirect to ticket page
      router.push(`/account/tickets/${paymentModal.order.orderNumber || paymentModal.order.id}`);
    } catch (err) {
      alert("Gagal memproses simulasi webhook: " + err.message);
      setSimulating(false);
    }
  }

  if (loading || !event) {
    return (
      <div className="min-h-screen text-slate-100">
        <PublicHeader />
        <div className="py-20 text-center">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
          <p className="text-xs text-slate-400">Menyiapkan sesi checkout aman...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-slate-100">
      <PublicHeader />

      <main className="mx-auto max-w-6xl px-6 py-10">
        {/* Reservation Holding Banner */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs">
          <div className="flex items-center gap-2.5 text-amber-300">
            <Clock size={16} className="shrink-0 animate-pulse text-amber-400" />
            <span>
              Reservasi kuota tiketmu dikunci sementara. Selesaikan checkout sebelum waktu habis.
            </span>
          </div>
          <div className="font-mono text-sm font-bold text-white bg-black/40 px-3 py-1 rounded-xl border border-white/10 self-start sm:self-auto">
            ⏱️ {formatTimer(timeLeft)}
          </div>
        </div>

        <Link
          href={`/events/${id}`}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 transition-colors hover:text-white mb-6"
        >
          <ArrowLeft size={14} /> Kembali ke Detail Event
        </Link>

        <form onSubmit={handleCheckout} className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_400px]">
          {/* Left Column: Form & Payment Selection */}
          <div className="space-y-6">
            {/* Event Summary Card */}
            <div className="glass-panel rounded-3xl border border-white/10 bg-[#12141F] p-6">
              <span className="rounded-full bg-violet-500/10 border border-violet-500/30 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-violet-300">
                {event.genre}
              </span>
              <h2 className="mt-2 text-xl font-black text-white">{event.title || event.name}</h2>
              <p className="text-xs text-slate-400 mt-1">
                {event.venueName || event.venue}, {event.venueCity || event.city} • {formatDate(event.date)}
              </p>
            </div>

            {/* Ticket Tier & Quantity Selector */}
            <div className="glass-panel rounded-3xl border border-white/10 bg-[#12141F] p-6">
              <h3 className="text-sm font-bold text-white mb-4">Pilih Kategori & Jumlah Tiket</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                {event.categories?.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`flex flex-col text-left p-4 rounded-2xl border transition-all ${
                      selectedCategory?.id === cat.id
                        ? "border-violet-500 bg-violet-600/15 shadow-md shadow-violet-600/20"
                        : "border-white/5 bg-white/[0.02] hover:border-white/20"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-xs text-white">{cat.name}</span>
                      {selectedCategory?.id === cat.id && (
                        <CheckCircle2 size={16} className="text-amber-400" />
                      )}
                    </div>
                    <span className="mt-2 text-sm font-black text-amber-400">{formatIDR(cat.price)}</span>
                    <span className="text-[10px] text-slate-400 mt-0.5">Sisa: {cat.remainingQuota || cat.quota} tiket</span>
                  </button>
                ))}
              </div>

              {/* Quantity */}
              <div className="flex items-center justify-between border-t border-white/5 pt-4">
                <div>
                  <p className="text-xs font-semibold text-white">Jumlah Tiket</p>
                  <p className="text-[10px] text-slate-400">Maksimal {event.purchaseLimit || 4} tiket per transaksi</p>
                </div>

                <div className="flex items-center gap-3">
                  {[1, 2, 3, 4].filter((n) => n <= (event.purchaseLimit || 4)).map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setQty(n)}
                      className={`h-9 w-9 rounded-xl font-mono text-xs font-bold transition-all ${
                        qty === n
                          ? "bg-violet-600 text-white shadow-md shadow-violet-600/30"
                          : "border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Attendee Identity Form */}
            <div className="glass-panel rounded-3xl border border-white/10 bg-[#12141F] p-6 space-y-4">
              <h3 className="text-sm font-bold text-white">Data Pengunjung Konser</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300">Nama Lengkap Sesuai KTP</label>
                  <input
                    type="text"
                    required
                    value={attendeeName}
                    onChange={(e) => setAttendeeName(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-xs text-white focus:border-violet-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300">Alamat Email</label>
                  <input
                    type="email"
                    required
                    value={attendeeEmail}
                    onChange={(e) => setAttendeeEmail(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-xs text-white focus:border-violet-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300">Nomor WhatsApp Aktif</label>
                  <input
                    type="tel"
                    required
                    value={attendeePhone}
                    onChange={(e) => setAttendeePhone(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-xs text-white focus:border-violet-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300">
                    NIK KTP (16 Digit) <span className="text-[10px] text-amber-400 font-normal">Terkunci di Gate</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={16}
                    value={attendeeNik}
                    onChange={(e) => setAttendeeNik(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-xs text-white focus:border-violet-500 focus:outline-none font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="glass-panel rounded-3xl border border-white/10 bg-[#12141F] p-6">
              <h3 className="text-sm font-bold text-white mb-4">Pilih Metode Pembayaran</h3>

              <div className="space-y-2.5">
                {PAYMENT_METHODS.map((pm) => {
                  const Icon = pm.icon;
                  return (
                    <label
                      key={pm.id}
                      className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all ${
                        paymentMethod === pm.id
                          ? "border-amber-500/60 bg-amber-500/10 shadow-sm shadow-amber-500/10"
                          : "border-white/5 bg-white/[0.02] hover:border-white/20"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="payment"
                          checked={paymentMethod === pm.id}
                          onChange={() => setPaymentMethod(pm.id)}
                          className="text-amber-500 focus:ring-0"
                        />
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-slate-300">
                          <Icon size={16} />
                        </div>
                        <span className="text-xs font-semibold text-white">{pm.name}</span>
                      </div>
                      <span className="rounded bg-white/5 px-2 py-0.5 text-[9px] uppercase tracking-wider text-slate-400">
                        {pm.category}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary & Pay Button */}
          <div>
            <div className="glass-panel sticky top-24 rounded-3xl border border-white/10 bg-[#12141F] p-6 shadow-2xl shadow-violet-950/40">
              <h3 className="text-sm font-bold text-white border-b border-white/5 pb-4">Ringkasan Pembayaran</h3>

              <div className="mt-4 space-y-3 text-xs text-slate-400">
                <div className="flex justify-between">
                  <span>{selectedCategory?.name} ({qty}x)</span>
                  <span className="font-semibold text-white">{formatIDR(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Biaya Layanan Platform (5%)</span>
                  <span className="font-semibold text-white">{formatIDR(platformFee)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Biaya Administrasi Transaksi</span>
                  <span className="font-semibold text-white">{formatIDR(adminFee)}</span>
                </div>

                <div className="border-t border-dashed border-white/10 pt-4 flex justify-between items-baseline">
                  <span className="text-sm font-bold text-white">Total Tagihan</span>
                  <span className="text-xl font-black text-amber-400">{formatIDR(finalAmount)}</span>
                </div>
              </div>

              {error && <p className="mt-4 text-xs text-rose-400 bg-rose-500/10 p-3 rounded-xl border border-rose-500/20">{error}</p>}

              <button
                type="submit"
                disabled={submitting}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 py-3.5 text-xs font-black uppercase tracking-wider text-white shadow-xl shadow-amber-500/30 transition-all hover:opacity-95 disabled:opacity-50"
              >
                {submitting ? "Memproses Pembayaran..." : "Bayar Sekarang"}
                <ArrowRight size={15} />
              </button>

              <div className="mt-4 flex items-center justify-center gap-1.5 text-[10px] text-slate-400 text-center">
                <ShieldCheck size={13} className="text-emerald-400 shrink-0" />
                <span>Transaksi dijamin aman & terenkripsi oleh Midtrans Payment Gateway</span>
              </div>
            </div>
          </div>
        </form>

        {/* Midtrans Payment Gateway Modal */}
        {paymentModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
            <div className="glass-panel w-full max-w-md rounded-3xl border border-white/10 bg-[#12141F] p-7 shadow-2xl shadow-violet-950/60 text-center space-y-5 animate-in fade-in zoom-in-95 duration-200">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-violet-600 to-amber-500 shadow-lg shadow-violet-600/30">
                <Sparkles size={24} className="text-white" />
              </div>

              <div>
                <span className="rounded-full bg-violet-500/10 border border-violet-500/30 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-violet-300">
                  {paymentModal.payment?.provider || "MIDTRANS"} PAYMENT GATEWAY
                </span>
                <h3 className="mt-3 text-xl font-black text-white">Menunggu Pembayaran</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Pesanan <span className="font-mono text-paper font-bold">{paymentModal.order?.orderNumber}</span>
                </p>
                <p className="mt-2 text-2xl font-black text-amber-400">
                  {formatIDR(paymentModal.order?.finalAmount || finalAmount)}
                </p>
              </div>

              {/* QRIS Display */}
              {paymentQrDataUrl && (
                <div className="space-y-3">
                  <div className="mx-auto w-48 rounded-2xl bg-white p-3 shadow-xl">
                    <img src={paymentQrDataUrl} alt="QRIS Payment" className="w-full h-auto" />
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Buka GoPay, OVO, Dana, BCA Mobile, atau perbankan apa saja dan pindai QR di atas.
                  </p>
                </div>
              )}

              {/* Virtual Account Display */}
              {paymentModal.payment?.vaNumber && (
                <div className="rounded-2xl border border-white/10 bg-black/40 p-4 space-y-1.5 text-left">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Nomor Virtual Account</p>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-base font-bold text-white tracking-wider">
                      {paymentModal.payment.vaNumber}
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard?.writeText(paymentModal.payment.vaNumber);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }}
                      className="flex items-center gap-1 text-[11px] font-semibold text-amber-400 hover:text-white"
                    >
                      <Copy size={12} />
                      {copied ? "Tersalin!" : "Salin"}
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-500">Bank: {paymentMethod.replace("_VA", "")}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={handleSimulatePayment}
                  disabled={simulating}
                  className="w-full rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 py-3 text-xs font-bold text-white shadow-lg shadow-emerald-500/20 hover:opacity-95 transition-all flex items-center justify-center gap-2"
                >
                  {simulating ? <Clock size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                  {simulating ? "Memverifikasi..." : "⚡ Simulasi Pembayaran Sukses (Webhook)"}
                </button>

                {paymentModal.payment?.paymentUrl && (
                  <a
                    href={paymentModal.payment.paymentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full items-center justify-center gap-1.5 rounded-2xl border border-white/10 bg-white/5 py-2.5 text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    Buka Halaman Midtrans Snap <ExternalLink size={12} />
                  </a>
                )}

                <button
                  onClick={() => router.push(`/account/tickets/${paymentModal.order?.orderNumber || paymentModal.order?.id}`)}
                  className="w-full py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
                >
                  Lewati dan Langsung Buka Tiket →
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <RequireRole roles={["customer", "admin", "super_admin"]}>
      <CheckoutBody />
    </RequireRole>
  );
}
