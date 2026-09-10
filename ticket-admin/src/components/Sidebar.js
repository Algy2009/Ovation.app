"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, Ticket, PlusCircle, LineChart, Wallet, ShieldCheck, Headset, ShieldAlert, RotateCcw, LogOut, Globe } from "lucide-react";
import Mark from "./Mark";
import { useAuth } from "@/lib/auth";

const ADMIN_NAV = [
  { href: "/admin", label: "Ringkasan", icon: LayoutGrid, exact: true },
  { href: "/admin/events", label: "Event & Tiket", icon: Ticket },
  { href: "/admin/analytics", label: "Analitik Penjualan", icon: LineChart },
  { href: "/admin/reconciliation", label: "Rekonsiliasi", icon: Wallet },
];

const SUPERADMIN_NAV = [
  { href: "/superadmin", label: "Ringkasan", icon: LayoutGrid, exact: true },
  { href: "/superadmin/organizers", label: "Event Organizer", icon: ShieldCheck },
  { href: "/superadmin/support", label: "Customer Service", icon: Headset },
  { href: "/superadmin/fraud", label: "Anti Calo & Fraud", icon: ShieldAlert },
  { href: "/superadmin/refunds", label: "Refund & Komplain", icon: RotateCcw },
];

export default function Sidebar({ section = "admin" }) {
  const pathname = usePathname();
  const { session, logout } = useAuth();
  const nav = section === "superadmin" ? SUPERADMIN_NAV : ADMIN_NAV;

  function handleLogout() {
    logout();
  }

  return (
    <aside className="flex h-screen w-60 shrink-0 flex-col border-r border-line bg-panel">
      <div className="flex items-center gap-2 border-b border-line px-5 py-6">
        <Mark className="h-6 w-9 text-gold" />
        <div>
          <p className="font-display text-lg leading-none tracking-tight text-paper">OVATION</p>
          <p className="mt-1 text-[11px] text-silver-dim">
            {section === "superadmin" ? "Super Admin" : "Admin Console"}
          </p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
        {nav.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors ${
                active ? "bg-panel-raised text-paper" : "text-silver hover:bg-panel-raised/60 hover:text-paper"
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${active ? "bg-gold" : "bg-transparent"}`} aria-hidden />
              <Icon size={16} strokeWidth={2} />
              {label}
            </Link>
          );
        })}

        {section === "admin" && (
          <Link
            href="/admin/events/new"
            className="mt-3 flex items-center gap-2 rounded-md border border-dashed border-line px-3 py-2.5 text-sm text-silver transition-colors hover:border-gold hover:text-gold"
          >
            <PlusCircle size={16} />
            Event baru
          </Link>
        )}

        <div className="mt-4 border-t border-line pt-4">
          {session?.role === "super_admin" && (
            <Link
              href={section === "superadmin" ? "/admin" : "/superadmin"}
              className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-silver hover:bg-panel-raised/60 hover:text-paper"
            >
              <ShieldCheck size={16} />
              {section === "superadmin" ? "Buka Admin Console" : "Buka Super Admin"}
            </Link>
          )}
          <Link
            href="/"
            className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-silver hover:bg-panel-raised/60 hover:text-paper"
          >
            <Globe size={16} />
            Lihat situs publik
          </Link>
        </div>
      </nav>

      <div className="border-t border-line px-5 py-4">
        <p className="text-sm text-paper">{session?.name ?? "—"}</p>
        <p className="mt-0.5 truncate text-[11px] text-silver-dim">{session?.email ?? ""}</p>
        <button
          onClick={handleLogout}
          className="mt-3 flex items-center gap-1.5 text-xs text-silver-dim hover:text-red"
        >
          <LogOut size={12} /> Keluar
        </button>
      </div>
    </aside>
  );
}
