"use client";

import Link from "next/link";
import { useData } from "@/lib/store";
import { ShieldCheck, Headset, ShieldAlert, RotateCcw, ArrowUpRight, Activity } from "lucide-react";

export default function SuperAdminHome() {
  const { organizers, supportTickets, orders, refundRequests, loading } = useData();

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
        <p className="text-xs text-slate-400">Memuat overview platform...</p>
      </div>
    );
  }

  const pendingOrganizers = organizers.filter((o) => o.status === "pending").length;
  const openTickets = supportTickets.filter((t) => t.status === "open").length;
  const flaggedOrders = orders.filter((o) => o.flagged && o.status !== "blocked").length;
  const pendingRefunds = refundRequests.filter((r) => r.status === "pending" || r.status === "requested").length;

  const cards = [
    {
      href: "/superadmin/organizers",
      label: "Promotor Menunggu Verifikasi",
      value: pendingOrganizers,
      icon: ShieldCheck,
      color: "from-amber-500/20 to-orange-500/10 text-amber-400 border-amber-500/30",
    },
    {
      href: "/superadmin/fraud",
      label: "Deteksi Fraud & Anti-Calo",
      value: flaggedOrders,
      icon: ShieldAlert,
      color: "from-rose-500/20 to-red-500/10 text-rose-400 border-rose-500/30",
    },
    {
      href: "/superadmin/refunds",
      label: "Permintaan Refund Tertunda",
      value: pendingRefunds,
      icon: RotateCcw,
      color: "from-violet-500/20 to-indigo-500/10 text-violet-400 border-violet-500/30",
    },
    {
      href: "/superadmin/support",
      label: "Tiket Customer Service",
      value: openTickets,
      icon: Headset,
      color: "from-emerald-500/20 to-teal-500/10 text-emerald-400 border-emerald-500/30",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="pb-6 border-b border-white/5 flex items-center justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-violet-500/10 border border-violet-500/30 px-3 py-1 text-xs font-semibold text-violet-300 mb-2">
            <Activity size={13} className="text-emerald-400 animate-pulse" />
            Platform Oversight & Governance
          </div>
          <h1 className="text-3xl font-black text-white">Super Admin Console</h1>
          <p className="mt-1 text-xs text-slate-400">
            Pusat kendali operasional, verifikasi promotor, audit calo, dan penyelesaian refund.
          </p>
        </div>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {cards.map(({ href, label, value, icon: Icon, color }) => (
          <Link
            key={href}
            href={href}
            className="glass-panel group relative overflow-hidden rounded-2xl border border-white/10 bg-[#12141F] p-6 transition-all hover:border-violet-500/40 hover:-translate-y-1 hover:shadow-xl hover:shadow-violet-950/30"
          >
            <div className="flex items-start justify-between">
              <div className={`flex h-11 w-11 items-center justify-center rounded-xl border bg-gradient-to-br ${color}`}>
                <Icon size={22} />
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-slate-400 transition-colors group-hover:bg-violet-600 group-hover:text-white">
                <ArrowUpRight size={16} />
              </div>
            </div>

            <p className="mt-6 text-4xl font-black text-white tracking-tight">{value}</p>
            <p className="mt-1 text-xs font-semibold text-slate-300">{label}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
