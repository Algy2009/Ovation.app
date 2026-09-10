"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useData } from "@/lib/store";
import PublicHeader from "@/components/PublicHeader";
import { Users } from "lucide-react";

const TOTAL_MS = 6000;

function QueueBody() {
  const { id } = useParams();
  const router = useRouter();
  const params = useSearchParams();
  const { getEvent, loading } = useData();
  const [elapsed, setElapsed] = useState(0);
  const [position, setPosition] = useState(238);

  const next = params.get("next") || `/events/${id}`;

  useEffect(() => {
    const start = Date.now();
    const timer = setInterval(() => {
      const t = Date.now() - start;
      setElapsed(t);
      setPosition((p) => Math.max(0, p - Math.ceil(Math.random() * 18)));
      if (t >= TOTAL_MS) {
        clearInterval(timer);
        router.replace(next);
      }
    }, 350);
    return () => clearInterval(timer);
  }, [next, router]);

  if (loading) return null;
  const event = getEvent(id);
  const pct = Math.min(100, Math.round((elapsed / TOTAL_MS) * 100));

  return (
    <div className="min-h-screen bg-ink text-paper">
      <PublicHeader />
      <div className="mx-auto flex max-w-md flex-col items-center px-6 py-20 text-center">
        <Users size={28} className="text-gold" />
        <h1 className="mt-4 font-display text-2xl tracking-tight text-paper">Kamu sedang dalam antrian</h1>
        <p className="mt-2 text-sm text-silver-dim">
          Permintaan tinggi untuk {event?.name ?? "event ini"}. Mohon tunggu, jangan tutup halaman ini.
        </p>

        <div className="mt-8 w-full">
          <div className="h-2 w-full overflow-hidden rounded-full bg-panel-raised">
            <div className="h-full rounded-full bg-gold transition-all" style={{ width: `${pct}%` }} />
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-silver-dim">
            <span>Posisi kamu: ~{Math.max(1, position)}</span>
            <span>{pct}%</span>
          </div>
        </div>

        <p className="mt-8 text-xs text-silver-dim">
          Kamu akan otomatis diarahkan ke halaman pembelian saat tiba giliranmu.
        </p>
      </div>
    </div>
  );
}

export default function QueuePage() {
  return (
    <Suspense fallback={null}>
      <QueueBody />
    </Suspense>
  );
}
