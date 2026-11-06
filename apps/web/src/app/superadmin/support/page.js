"use client";

import { useState } from "react";
import { useData } from "@/lib/store";
import { Send, CheckCircle2 } from "lucide-react";

function timeAgo(iso) {
  return new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }).format(
    new Date(iso)
  );
}

export default function SupportPage() {
  const { supportTickets, replyTicket, closeTicket, loading } = useData();
  const [activeId, setActiveId] = useState(null);
  const [draft, setDraft] = useState("");

  if (loading) return <p className="text-silver-dim">Memuat data…</p>;

  const sorted = [...supportTickets].sort((a, b) => (a.status === b.status ? 0 : a.status === "open" ? -1 : 1));
  const active = sorted.find((t) => t.id === activeId) ?? sorted[0] ?? null;

  function send() {
    if (!draft.trim() || !active) return;
    const text = draft.trim();
    setDraft("");
    replyTicket(active.id, text).catch((err) => alert(err.message));
  }

  return (
    <div>
      <h1 className="font-display text-3xl tracking-tight text-paper">Customer service</h1>
      <p className="mt-1 text-sm text-silver-dim">Tangani pertanyaan dan kendala dari pembeli tiket.</p>

      <div className="mt-6 grid grid-cols-[280px_1fr] gap-6">
        <div className="divide-y divide-line rounded-lg border border-line bg-panel">
          {sorted.length === 0 && <p className="px-4 py-6 text-sm text-silver-dim">Belum ada tiket.</p>}
          {sorted.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveId(t.id)}
              className={`block w-full px-4 py-3.5 text-left transition-colors ${
                active?.id === t.id ? "bg-panel-raised" : "hover:bg-panel-raised/60"
              }`}
            >
              <div className="flex items-center justify-between">
                <p className="truncate text-sm text-paper">{t.subject}</p>
                {t.status === "open" ? (
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                ) : (
                  <CheckCircle2 size={13} className="shrink-0 text-silver-dim" />
                )}
              </div>
              <p className="mt-0.5 truncate text-xs text-silver-dim">{t.buyerName}</p>
            </button>
          ))}
        </div>

        <div className="flex min-h-[420px] flex-col rounded-lg border border-line bg-panel">
          {!active ? (
            <p className="m-auto text-sm text-silver-dim">Pilih tiket untuk melihat percakapan.</p>
          ) : (
            <>
              <div className="flex items-center justify-between border-b border-line px-5 py-4">
                <div>
                  <p className="text-sm font-medium text-paper">{active.subject}</p>
                  <p className="text-xs text-silver-dim">{active.buyerName} · {active.buyerEmail}</p>
                </div>
                {active.status === "open" && (
                  <button
                    onClick={() => closeTicket(active.id).catch((err) => alert(err.message))}
                    className="rounded-md border border-line px-3 py-1.5 text-xs text-silver-dim hover:border-gold hover:text-gold"
                  >
                    Tandai selesai
                  </button>
                )}
              </div>

              <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
                {active.messages.map((m, i) => (
                  <div key={i} className={`flex ${m.from === "admin" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[75%] rounded-lg px-3.5 py-2.5 text-sm ${
                        m.from === "admin" ? "bg-gold text-ink" : "bg-panel-raised text-paper"
                      }`}
                    >
                      <p>{m.text}</p>
                      <p className={`mt-1 text-[10px] ${m.from === "admin" ? "text-ink/60" : "text-silver-dim"}`}>
                        {timeAgo(m.at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {active.status === "open" && (
                <div className="flex items-center gap-2 border-t border-line px-4 py-3">
                  <input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && send()}
                    placeholder="Tulis balasan…"
                    className="flex-1 rounded-md border border-line bg-panel-raised px-3 py-2 text-sm text-paper placeholder:text-silver-dim focus:border-gold focus:outline-none"
                  />
                  <button onClick={send} className="rounded-md bg-gold p-2.5 text-ink hover:opacity-90" aria-label="Kirim">
                    <Send size={15} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
