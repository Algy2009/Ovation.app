"use client";

import { useData } from "@/lib/store";
import { Check, X } from "lucide-react";

const STATUS_STYLE = {
  pending: "bg-gold/15 text-gold",
  approved: "bg-panel-raised text-silver",
  rejected: "bg-red/15 text-red",
};
const STATUS_LABEL = { pending: "Menunggu", approved: "Disetujui", rejected: "Ditolak" };

export default function OrganizersPage() {
  const { organizers, approveOrganizer, rejectOrganizer, loading } = useData();

  if (loading) return <p className="text-silver-dim">Memuat data…</p>;

  const pending = organizers.filter((o) => o.status === "pending");
  const decided = organizers.filter((o) => o.status !== "pending");

  return (
    <div>
      <h1 className="font-display text-3xl tracking-tight text-paper">Event organizer</h1>
      <p className="mt-1 text-sm text-silver-dim">
        Verifikasi organizer baru sebelum mereka bisa membuat dan menjual event.
      </p>

      <h2 className="mt-8 font-display text-lg tracking-tight text-paper">Menunggu approval</h2>
      <div className="mt-3 space-y-3">
        {pending.length === 0 && (
          <p className="rounded-lg border border-dashed border-line px-5 py-6 text-center text-sm text-silver-dim">
            Tidak ada pengajuan baru.
          </p>
        )}
        {pending.map((o) => (
          <div key={o.id} className="flex items-center justify-between rounded-md border border-line bg-panel px-5 py-4">
            <div>
              <p className="text-sm font-medium text-paper">{o.name}</p>
              <p className="text-xs text-silver-dim">{o.company} · {o.email}</p>
              <p className="mt-0.5 text-xs text-silver-dim">Diajukan {o.submittedAt}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => approveOrganizer(o.id).catch((err) => alert(err.message))}
                className="flex items-center gap-1.5 rounded-md bg-gold px-3 py-2 text-sm font-medium text-ink hover:opacity-90"
              >
                <Check size={14} /> Setujui
              </button>
              <button
                onClick={() => rejectOrganizer(o.id).catch((err) => alert(err.message))}
                className="flex items-center gap-1.5 rounded-md border border-line px-3 py-2 text-sm text-silver-dim hover:border-red hover:text-red"
              >
                <X size={14} /> Tolak
              </button>
            </div>
          </div>
        ))}
      </div>

      <h2 className="mt-10 font-display text-lg tracking-tight text-paper">Riwayat keputusan</h2>
      <div className="mt-3 divide-y divide-line rounded-lg border border-line bg-panel">
        {decided.map((o) => (
          <div key={o.id} className="flex items-center justify-between px-5 py-3.5">
            <div>
              <p className="text-sm text-paper">{o.name}</p>
              <p className="text-xs text-silver-dim">{o.company}</p>
            </div>
            <span className={`rounded-full px-2 py-0.5 text-[11px] ${STATUS_STYLE[o.status]}`}>
              {STATUS_LABEL[o.status]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
