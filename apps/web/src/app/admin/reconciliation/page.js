"use client";

import { useEffect, useMemo, useState } from "react";
import { useData } from "@/lib/store";
import { formatIDR } from "@/lib/format";
import { Download, Wallet, ArrowUpRight, CheckCircle2, Clock, AlertCircle } from "lucide-react";

const PLATFORM_FEE_RATE = 0.05;

export default function ReconciliationPage() {
  const { events, loading } = useData();
  const [settlements, setSettlements] = useState([]);
  const [requestingEventId, setRequestingEventId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const rows = useMemo(() => {
    const list = [];
    for (const e of events) {
      for (const c of e.categories || []) {
        const gross = c.sold * c.price;
        const fee = Math.round(gross * PLATFORM_FEE_RATE);
        list.push({
          eventId: e.id,
          eventName: e.name || e.title,
          categoryName: c.name,
          sold: c.sold,
          price: c.price,
          gross,
          fee,
          net: gross - fee,
        });
      }
    }
    return list.filter((r) => r.sold > 0);
  }, [events]);

  const totals = rows.reduce(
    (acc, r) => ({
      gross: acc.gross + r.gross,
      fee: acc.fee + r.fee,
      net: acc.net + r.net,
    }),
    { gross: 0, fee: 0, net: 0 }
  );

  async function loadSettlements() {
    try {
      const res = await fetch("/api/settlements");
      const data = await res.json();
      if (Array.isArray(data)) {
        setSettlements(data);
      }
    } catch (err) {
      console.error("Load settlements error:", err);
    }
  }

  useEffect(() => {
    loadSettlements();
  }, []);

  async function handleRequestPayout(e) {
    e.preventDefault();
    if (!requestingEventId) return;

    setSubmitting(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch("/api/settlements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId: requestingEventId }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal mengajukan pencairan dana.");
      }

      setMessage("Pengajuan pencairan saldo berhasil dikirim. Menunggu verifikasi transfer dari Super Admin.");
      loadSettlements();
      setRequestingEventId("");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  function exportCsv() {
    const header = ["Event", "Kategori", "Terjual", "Harga", "Pendapatan Kotor", "Fee Platform (5%)", "Diterima Organizer"];
    const lines = rows.map((r) => [r.eventName, r.categoryName, r.sold, r.price, r.gross, r.fee, r.net].join(","));
    const csv = [header.join(","), ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rekonsiliasi-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (loading) return <p className="text-silver-dim">Memuat data…</p>;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl tracking-tight text-paper">Settlement & Bagi Hasil</h1>
          <p className="mt-1 text-sm text-silver-dim">
            Rekapitulasi pendapatan kotor, potongan platform fee (5%), dan penarikan saldo bersih promotor.
          </p>
        </div>
        <button
          onClick={exportCsv}
          className="flex items-center gap-2 rounded-md border border-line px-3.5 py-2 text-sm text-silver hover:border-gold hover:text-gold transition-colors self-start sm:self-auto"
        >
          <Download size={15} /> Ekspor Laporan CSV
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-px overflow-hidden rounded-2xl border border-line bg-line">
        <div className="bg-panel px-6 py-5">
          <p className="text-xs uppercase tracking-wider text-silver-dim font-medium">Total Pendapatan Kotor</p>
          <p className="mt-2 font-display text-2xl text-paper">{formatIDR(totals.gross)}</p>
        </div>
        <div className="bg-panel px-6 py-5">
          <p className="text-xs uppercase tracking-wider text-silver-dim font-medium">Potongan Platform (5%)</p>
          <p className="mt-2 font-display text-2xl text-rose-400">{formatIDR(totals.fee)}</p>
        </div>
        <div className="bg-panel px-6 py-5">
          <p className="text-xs uppercase tracking-wider text-silver-dim font-medium">Hak Bersih Promotor</p>
          <p className="mt-2 font-display text-2xl text-gold">{formatIDR(totals.net)}</p>
        </div>
      </div>

      {/* Payout Request Section */}
      <div className="rounded-2xl border border-white/10 bg-[#12141F] p-6">
        <div className="flex items-center gap-2 text-gold mb-2">
          <Wallet size={18} />
          <h2 className="text-sm font-bold text-white">Ajukan Pencairan Dana Bersih (Payout)</h2>
        </div>
        <p className="text-xs text-slate-400 mb-4">
          Pilih konser yang ingin dicairkan dananya ke rekening bank resmi promotor yang terverifikasi.
        </p>

        <form onSubmit={handleRequestPayout} className="flex flex-col sm:flex-row gap-3">
          <select
            value={requestingEventId}
            onChange={(e) => setRequestingEventId(e.target.value)}
            className="flex-1 rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-xs text-white focus:border-violet-500 focus:outline-none"
          >
            <option value="">-- Pilih Event Konser --</option>
            {events.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name || e.title} ({e.city || e.venueCity})
              </option>
            ))}
          </select>

          <button
            type="submit"
            disabled={submitting || !requestingEventId}
            className="rounded-xl bg-gold px-5 py-2.5 text-xs font-bold text-ink transition-all hover:opacity-90 disabled:opacity-50"
          >
            {submitting ? "Memproses..." : "Ajukan Pencairan Dana"}
          </button>
        </form>

        {message && <p className="mt-3 text-xs text-emerald-400 flex items-center gap-1.5"><CheckCircle2 size={13} /> {message}</p>}
        {error && <p className="mt-3 text-xs text-rose-400 flex items-center gap-1.5"><AlertCircle size={13} /> {error}</p>}
      </div>

      {/* Riwayat Settlement Table */}
      {settlements.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-display text-lg tracking-tight text-paper">Riwayat Pengajuan Pencairan ({settlements.length})</h2>
          <div className="overflow-hidden rounded-2xl border border-line">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-panel-raised text-left uppercase tracking-wider text-silver-dim">
                  <th className="px-4 py-3 font-medium">Nomor STL</th>
                  <th className="px-4 py-3 font-medium">Event</th>
                  <th className="px-4 py-3 text-right font-medium">Kotor</th>
                  <th className="px-4 py-3 text-right font-medium">Fee (5%)</th>
                  <th className="px-4 py-3 text-right font-medium">Net Payout</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Rekening Tujuan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line bg-panel">
                {settlements.map((s) => (
                  <tr key={s.id} className="hover:bg-panel-raised/50">
                    <td className="px-4 py-3 font-mono text-paper">{s.settlementNumber}</td>
                    <td className="px-4 py-3 text-paper font-medium">{s.eventName}</td>
                    <td className="px-4 py-3 text-right text-paper">{formatIDR(s.totalGrossSales)}</td>
                    <td className="px-4 py-3 text-right text-rose-400">{formatIDR(s.totalPlatformFee)}</td>
                    <td className="px-4 py-3 text-right text-gold font-bold">{formatIDR(s.netPayoutAmount)}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        s.status === "TRANSFERRED"
                          ? "bg-emerald-500/20 text-emerald-300"
                          : s.status === "APPROVED"
                          ? "bg-amber-500/20 text-amber-300"
                          : s.status === "REJECTED"
                          ? "bg-rose-500/20 text-rose-300"
                          : "bg-white/10 text-white"
                      }`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-silver-dim">{s.bankInfo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Rincian Kategori Table */}
      <div className="space-y-3">
        <h2 className="font-display text-lg tracking-tight text-paper">Rincian Penjualan per Kategori</h2>
        <div className="overflow-hidden rounded-2xl border border-line">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-panel-raised text-left uppercase tracking-wider text-silver-dim">
                <th className="px-4 py-3 font-medium">Event / Kategori</th>
                <th className="px-4 py-3 text-right font-medium">Terjual</th>
                <th className="px-4 py-3 text-right font-medium">Harga Satuan</th>
                <th className="px-4 py-3 text-right font-medium">Kotor</th>
                <th className="px-4 py-3 text-right font-medium">Fee (5%)</th>
                <th className="px-4 py-3 text-right font-medium">Diterima Organizer</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line bg-panel">
              {rows.map((r, i) => (
                <tr key={i} className="hover:bg-panel-raised/50">
                  <td className="px-4 py-3 text-paper font-medium">{r.eventName} — {r.categoryName}</td>
                  <td className="px-4 py-3 text-right text-silver font-mono">{r.sold.toLocaleString("id-ID")}</td>
                  <td className="px-4 py-3 text-right text-silver">{formatIDR(r.price)}</td>
                  <td className="px-4 py-3 text-right text-paper">{formatIDR(r.gross)}</td>
                  <td className="px-4 py-3 text-right text-rose-400">{formatIDR(r.fee)}</td>
                  <td className="px-4 py-3 text-right text-gold font-bold">{formatIDR(r.net)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
