"use client";

import { useState } from "react";
import Link from "next/link";
import { useData } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import PublicHeader from "@/components/PublicHeader";
import { Send, Headset, PlusCircle } from "lucide-react";

function timeAgo(iso) {
  return new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }).format(
    new Date(iso)
  );
}

export default function HelpPage() {
  const { session, loading: authLoading } = useAuth();
  const { getTicketsFor, createTicket, replyTicket, loading } = useData();
  const [activeId, setActiveId] = useState(null);
  const [draft, setDraft] = useState("");
  const [newSubject, setNewSubject] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [error, setError] = useState("");

  if (authLoading) return null;

  if (!session || session.role !== "customer") {
    return (
      <div className="min-h-screen bg-ink text-paper">
        <PublicHeader />
        <div className="mx-auto max-w-md px-6 py-16 text-center">
          <Headset size={26} className="mx-auto text-gold" />
          <h1 className="mt-4 font-display text-2xl text-paper">Butuh bantuan?</h1>
          <p className="mt-2 text-sm text-silver-dim">Masuk dulu untuk menghubungi customer service kami.</p>
          <Link
            href="/login?next=/help"
            className="mt-5 inline-block rounded-md bg-gold px-4 py-2 text-sm font-medium text-ink hover:opacity-90"
          >
            Masuk
          </Link>
        </div>
      </div>
    );
  }

  if (loading) return null;

  const tickets = getTicketsFor(session.email).sort((a, b) => (a.status === b.status ? 0 : a.status === "open" ? -1 : 1));
  const active = tickets.find((t) => t.id === activeId) ?? tickets[0] ?? null;

  function send() {
    if (!draft.trim() || !active) return;
    const text = draft.trim();
    setDraft("");
    replyTicket(active.id, text).catch((err) => setError(err.message));
  }

  async function submitNewTicket(e) {
    e.preventDefault();
    if (!newSubject.trim() || !newMessage.trim()) return;
    try {
      await createTicket({ subject: newSubject.trim(), message: newMessage.trim() });
      setNewSubject("");
      setNewMessage("");
      setShowNew(false);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="min-h-screen bg-ink text-paper">
      <PublicHeader />
      <div className="mx-auto max-w-4xl px-6 py-8">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="font-display text-3xl tracking-tight text-paper">Bantuan</h1>
            <p className="mt-1 text-sm text-silver-dim">Chat langsung dengan tim customer service Ovation.</p>
          </div>
          <button
            onClick={() => setShowNew((v) => !v)}
            className="flex items-center gap-2 rounded-md bg-gold px-4 py-2 text-sm font-medium text-ink hover:opacity-90"
          >
            <PlusCircle size={16} /> Tiket baru
          </button>
        </div>

        {showNew && (
          <form onSubmit={submitNewTicket} className="mt-5 space-y-3 rounded-lg border border-line bg-panel p-5">
            <input
              value={newSubject}
              onChange={(e) => setNewSubject(e.target.value)}
              placeholder="Topik, cth. E-tiket belum masuk"
              className="w-full rounded-md border border-line bg-panel-raised px-3 py-2.5 text-sm text-paper placeholder:text-silver-dim focus:border-gold focus:outline-none"
            />
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              rows={3}
              placeholder="Jelaskan kendala kamu"
              className="w-full rounded-md border border-line bg-panel-raised px-3 py-2.5 text-sm text-paper placeholder:text-silver-dim focus:border-gold focus:outline-none"
            />
            <button type="submit" className="rounded-md bg-gold px-4 py-2 text-sm font-medium text-ink hover:opacity-90">
              Kirim
            </button>
            {error && <p className="text-sm text-red">{error}</p>}
          </form>
        )}

        <div className="mt-6 grid grid-cols-[240px_1fr] gap-6">
          <div className="divide-y divide-line rounded-lg border border-line bg-panel">
            {tickets.length === 0 && (
              <p className="px-4 py-6 text-sm text-silver-dim">Belum ada tiket. Buat tiket baru untuk memulai.</p>
            )}
            {tickets.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveId(t.id)}
                className={`block w-full px-4 py-3.5 text-left transition-colors ${
                  active?.id === t.id ? "bg-panel-raised" : "hover:bg-panel-raised/60"
                }`}
              >
                <p className="truncate text-sm text-paper">{t.subject}</p>
                <p className="mt-0.5 text-xs text-silver-dim">{t.status === "open" ? "Terbuka" : "Selesai"}</p>
              </button>
            ))}
          </div>

          <div className="flex min-h-[380px] flex-col rounded-lg border border-line bg-panel">
            {!active ? (
              <p className="m-auto text-sm text-silver-dim">Pilih tiket untuk melihat percakapan.</p>
            ) : (
              <>
                <div className="border-b border-line px-5 py-4">
                  <p className="text-sm font-medium text-paper">{active.subject}</p>
                </div>
                <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
                  {active.messages.map((m, i) => (
                    <div key={i} className={`flex ${m.from === "customer" ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[75%] rounded-lg px-3.5 py-2.5 text-sm ${
                          m.from === "customer" ? "bg-gold text-ink" : "bg-panel-raised text-paper"
                        }`}
                      >
                        <p>{m.text}</p>
                        <p className={`mt-1 text-[10px] ${m.from === "customer" ? "text-ink/60" : "text-silver-dim"}`}>
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
                      placeholder="Tulis pesan…"
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
    </div>
  );
}
