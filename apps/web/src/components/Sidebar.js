"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  Ticket,
  LineChart,
  Wallet,
  ShieldCheck,
  Headset,
  ShieldAlert,
  RotateCcw,
  LogOut,
  Sparkles,
  QrCode,
  ArrowLeft,
} from "lucide-react";
import { useAuth } from "@/lib/auth";

const ADMIN_NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutGrid, exact: true },
  { href: "/admin/events", label: "Event & Tiket", icon: Ticket },
  { href: "/admin/scanner", label: "Gate Scanner QR", icon: QrCode },
  { href: "/admin/analytics", label: "Analitik Penjualan", icon: LineChart },
  { href: "/admin/reconciliation", label: "Settlement & Payout", icon: Wallet },
];

const SUPERADMIN_NAV = [
  { href: "/superadmin", label: "Overview Platform", icon: LayoutGrid, exact: true },
  { href: "/superadmin/events", label: "Moderasi Event", icon: Ticket },
  { href: "/superadmin/organizers", label: "Verifikasi Promotor", icon: ShieldCheck },
  { href: "/superadmin/refunds", label: "Refund & Sengketa", icon: RotateCcw },
  { href: "/superadmin/fraud", label: "Anti-Fraud & Calo", icon: ShieldAlert },
  { href: "/superadmin/support", label: "Customer Service", icon: Headset },
];

export default function Sidebar({ section = "admin" }) {
  const pathname = usePathname();
  const { session, logout } = useAuth();
  const nav = section === "superadmin" ? SUPERADMIN_NAV : ADMIN_NAV;

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-white/5 bg-[#0C0E17]">
      {/* Brand Header */}
      <div className="flex items-center gap-3 border-b border-white/5 px-6 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-amber-500 shadow-md shadow-violet-500/20">
          <Sparkles size={18} className="text-white" />
        </div>
        <div>
          <p className="font-bold tracking-wider text-white">OVATION</p>
          <p className="text-[11px] font-medium text-amber-400">
            {section === "superadmin" ? "Platform Oversight" : "Promoter Portal"}
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col gap-1.5 px-3.5 py-6">
        <div className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
          Menu Utama
        </div>
        {nav.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-medium transition-all ${
                active
                  ? "bg-violet-600/20 text-violet-300 border border-violet-500/30 shadow-sm shadow-violet-600/10"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon size={16} className={active ? "text-amber-400" : "text-slate-400"} />
              {label}
            </Link>
          );
        })}

        <div className="my-3 border-t border-white/5" />

        <div className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
          Akses Cepat
        </div>

        <Link
          href="/"
          className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-400 transition-all hover:bg-white/5 hover:text-white"
        >
          <ArrowLeft size={16} />
          Lihat Halaman Publik
        </Link>
      </nav>

      {/* User Info & Logout Footer */}
      <div className="border-t border-white/5 p-4">
        <div className="flex items-center justify-between rounded-xl bg-white/5 p-3">
          <div className="flex items-center gap-2.5 truncate">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600 text-xs font-bold text-white">
              {session?.name?.[0]?.toUpperCase() || "A"}
            </div>
            <div className="truncate">
              <p className="truncate text-xs font-semibold text-white">{session?.name}</p>
              <p className="truncate text-[10px] text-slate-400">{session?.email}</p>
            </div>
          </div>
          <button
            onClick={() => logout()}
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-rose-500/10 hover:text-rose-400"
            title="Keluar"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
