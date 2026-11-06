"use client";

import { useMemo } from "react";
import { useData } from "@/lib/store";
import { formatIDR } from "@/lib/format";
import { Download } from "lucide-react";

const PLATFORM_FEE_RATE = 0.05;

export default function ReconciliationPage() {
  const { events, loading } = useData();

  const rows = useMemo(() => {
    const list = [];
    for (const e of events) {
      for (const c of e.categories) {
        const gross = c.sold * c.price;
        const fee = Math.round(gross * PLATFORM_FEE_RATE);
        list.push({
          eventName: e.name,
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
    <div>
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-display text-3xl tracking-tight text-paper">Rekonsiliasi pendapatan</h1>
          <p className="mt-1 text-sm text-silver-dim">
            Potongan platform {Math.round(PLATFORM_FEE_RATE * 100)}% dari setiap kategori tiket terjual.
          </p>
        </div>
        <button
          onClick={exportCsv}
          className="flex items-center gap-2 rounded-md border border-line px-3 py-2 text-sm text-silver hover:border-gold hover:text-gold"
        >
          <Download size={15} /> Ekspor CSV
        </button>
      </div>

      <div className="mt-8 grid grid-cols-3 gap-px overflow-hidden rounded-lg border border-line bg-line">
        <div className="bg-panel px-5 py-4">
          <p className="text-sm text-silver-dim">Pendapatan kotor</p>
          <p className="mt-1 font-display text-2xl text-paper">{formatIDR(totals.gross)}</p>
        </div>
        <div className="bg-panel px-5 py-4">
          <p className="text-sm text-silver-dim">Fee platform</p>
          <p className="mt-1 font-display text-2xl text-paper">{formatIDR(totals.fee)}</p>
        </div>
        <div className="bg-panel px-5 py-4">
          <p className="text-sm text-silver-dim">Diterima organizer</p>
          <p className="mt-1 font-display text-2xl text-gold">{formatIDR(totals.net)}</p>
        </div>
      </div>

      <div className="mt-8 overflow-hidden rounded-lg border border-line">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-panel-raised text-left text-xs uppercase tracking-wide text-silver-dim">
              <th className="px-4 py-3 font-medium">Event / Kategori</th>
              <th className="px-4 py-3 text-right font-medium">Terjual</th>
              <th className="px-4 py-3 text-right font-medium">Kotor</th>
              <th className="px-4 py-3 text-right font-medium">Fee</th>
              <th className="px-4 py-3 text-right font-medium">Diterima</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line bg-panel">
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-silver-dim">
                  Belum ada tiket terjual untuk direkonsiliasi.
                </td>
              </tr>
            )}
            {rows.map((r, i) => (
              <tr key={i}>
                <td className="px-4 py-3">
                  <p className="text-paper">{r.eventName}</p>
                  <p className="text-xs text-silver-dim">{r.categoryName}</p>
                </td>
                <td className="px-4 py-3 text-right text-silver">{r.sold.toLocaleString("id-ID")}</td>
                <td className="px-4 py-3 text-right text-silver">{formatIDR(r.gross)}</td>
                <td className="px-4 py-3 text-right text-red">-{formatIDR(r.fee)}</td>
                <td className="px-4 py-3 text-right text-gold">{formatIDR(r.net)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
