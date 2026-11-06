"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import PublicHeader from "@/components/PublicHeader";
import RequireRole from "@/components/RequireRole";
import { Flame, Clock, Users, ShieldCheck, ArrowRight, RefreshCw } from "lucide-react";

function QueueWarRoom() {
  const { id } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get("next") || `/events/${id}`;

  const [queueToken, setQueueToken] = useState(null);
  const [queueNumber, setQueueNumber] = useState(null);
  const [position, setPosition] = useState(null);
  const [waitTime, setWaitTime] = useState(30);
  const [status, setStatus] = useState("JOINING");
  const [eventTitle, setEventTitle] = useState("");

  // Join queue on mount
  useEffect(() => {
    fetch("/api/queue/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventId: id }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.queueToken) {
          setQueueToken(data.queueToken);
          setQueueNumber(data.queueNumber);
          setPosition(data.position);
          setWaitTime(data.estimatedWaitSeconds || 30);
          setStatus(data.status);

          if (data.status === "ADMITTED") {
            setTimeout(() => {
              router.push(`${nextUrl}&token=${data.queueToken}`);
            }, 1500);
          }
        }
      })
      .catch((err) => console.error("Queue join error:", err));
  }, [id, nextUrl, router]);

  // Poll queue status
  useEffect(() => {
    if (!queueToken || status === "ADMITTED") return;

    const pollInterval = setInterval(() => {
      fetch(`/api/queue/status?token=${queueToken}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.status) {
            setStatus(data.status);
            if (data.eventTitle) setEventTitle(data.eventTitle);
            if (data.position !== undefined) setPosition(data.position);
            if (data.estimatedWaitSeconds !== undefined) setWaitTime(data.estimatedWaitSeconds);

            if (data.canCheckout || data.status === "ADMITTED") {
              clearInterval(pollInterval);
              setTimeout(() => {
                router.push(`${nextUrl}&token=${queueToken}`);
              }, 1200);
            }
          }
        })
        .catch((err) => console.error("Queue poll error:", err));
    }, 3000);

    return () => clearInterval(pollInterval);
  }, [queueToken, status, nextUrl, router]);

  return (
    <div className="min-h-screen text-slate-100">
      <PublicHeader />

      <main className="mx-auto max-w-lg px-6 py-16">
        <div className="glass-panel overflow-hidden rounded-3xl border border-white/10 bg-[#12141F] p-8 shadow-2xl shadow-violet-950/40 text-center">
          
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-500 shadow-xl shadow-amber-500/25">
            <Flame size={28} className="text-white animate-pulse" />
          </div>

          <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-amber-400">
            Virtual War Room Active
          </div>

          <h1 className="mt-4 text-2xl font-black text-white">
            {status === "ADMITTED" ? "Giliranmu Telah Tiba!" : "Kamu Berada Dalam Antrean"}
          </h1>

          <p className="mt-1 text-xs text-slate-400 max-w-sm mx-auto">
            {status === "ADMITTED"
              ? "Sesi checkout sedang disiapkan, kamu akan otomatis dialihkan..."
              : "Sistem mengatur laju pembelian secara adil untuk mencegah lonjakan server dan bot calo."}
          </p>

          {/* Queue Position Box */}
          <div className="mt-8 rounded-2xl border border-white/5 bg-black/40 p-6">
            {status === "ADMITTED" ? (
              <div className="flex flex-col items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                  <ShieldCheck size={28} />
                </div>
                <p className="text-sm font-bold text-emerald-400">Akses Checkout Terbuka</p>
                <div className="h-1.5 w-48 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full w-full bg-emerald-400 animate-pulse" />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Posisi Antreanmu
                  </span>
                  <div className="mt-1 flex items-baseline justify-center gap-1 font-mono">
                    <span className="text-5xl font-black text-amber-400">
                      {position ?? "..."}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-around border-t border-white/5 pt-4 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Clock size={14} className="text-violet-400" />
                    <span>Estimasi: ~{waitTime} detik</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Users size={14} className="text-amber-400" />
                    <span>No. Tiket: #{queueNumber || 1}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Safety Notice */}
          <div className="mt-6 flex items-center justify-center gap-2 text-[11px] text-slate-400">
            <RefreshCw size={12} className="animate-spin text-violet-400" />
            <span>Jangan merefresh halaman agar posisimu tidak berpindah.</span>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function QueuePage() {
  return (
    <RequireRole roles={["customer", "admin", "super_admin"]}>
      <QueueWarRoom />
    </RequireRole>
  );
}
