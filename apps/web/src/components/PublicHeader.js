"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Ticket, Sparkles, LayoutDashboard, ShieldAlert } from "lucide-react";
import NotificationBell from "./NotificationBell";
import { useAuth } from "@/lib/auth";

export default function PublicHeader() {
  const { session, logout } = useAuth();
  const pathname = usePathname();

  function handleLogout() {
    logout();
  }

  const isStaff = session?.role === "admin" || session?.role === "super_admin";
  const isSuperAdmin = session?.role === "super_admin";

  return (
    <header className="sticky top-0 z-40 border-b border-[rgba(255,255,255,0.08)] bg-[#090A0F]/85 backdrop-blur-xl transition-all">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5">
        
        {/* Brand Logo */}
        <Link href="/" className="group flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-amber-500 shadow-lg shadow-violet-500/25 transition-transform group-hover:scale-105">
            <Sparkles size={18} className="text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-black tracking-wider text-white">
              OVATION<span className="text-amber-400">.</span>
            </span>
            <span className="-mt-1 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
              Concert Tickets
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden items-center gap-1.5 md:flex">
          <Link
            href="/"
            className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
              pathname === "/"
                ? "bg-violet-600/20 text-violet-300 border border-violet-500/30"
                : "text-slate-300 hover:bg-white/5 hover:text-white"
            }`}
          >
            Jelajahi Konser
          </Link>

          {session?.role === "customer" && (
            <Link
              href="/account/tickets"
              className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
                pathname.startsWith("/account")
                  ? "bg-violet-600/20 text-violet-300 border border-violet-500/30"
                  : "text-slate-300 hover:bg-white/5 hover:text-white"
              }`}
            >
              Tiket Saya
            </Link>
          )}

          {isStaff && (
            <Link
              href="/admin"
              className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
                pathname.startsWith("/admin")
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                  : "text-slate-300 hover:bg-white/5 hover:text-white"
              }`}
            >
              <LayoutDashboard size={13} />
              Portal Promotor
            </Link>
          )}

          {isSuperAdmin && (
            <Link
              href="/superadmin"
              className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
                pathname.startsWith("/superadmin")
                  ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                  : "text-slate-300 hover:bg-white/5 hover:text-white"
              }`}
            >
              <ShieldAlert size={13} />
              Super Admin
            </Link>
          )}

          <Link
            href="/help"
            className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
              pathname === "/help"
                ? "bg-violet-600/20 text-violet-300 border border-violet-500/30"
                : "text-slate-300 hover:bg-white/5 hover:text-white"
            }`}
          >
            Bantuan
          </Link>
        </nav>

        {/* User Profile / Auth Actions */}
        <div className="flex items-center gap-3">
          {session ? (
            <div className="flex items-center gap-2">
              <NotificationBell />

              <Link
                href="/account/tickets"
                className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-slate-200 transition-all hover:border-violet-500/40 hover:bg-violet-500/10 hover:text-white"
              >
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-violet-600 text-[10px] font-bold text-white">
                  {session.name?.[0]?.toUpperCase() || "U"}
                </div>
                <span className="hidden sm:inline">{session.name?.split(" ")[0]}</span>
                <span className="rounded bg-white/10 px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-slate-300">
                  {session.role === "super_admin" ? "Super" : session.role === "admin" ? "Promotor" : "Member"}
                </span>
              </Link>

              <button
                onClick={handleLogout}
                className="rounded-full p-2 text-slate-400 transition-colors hover:bg-rose-500/10 hover:text-rose-400"
                title="Keluar Akun"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="rounded-full border border-white/15 px-4 py-1.5 text-xs font-semibold text-white transition-all hover:border-white/30 hover:bg-white/5"
              >
                Masuk
              </Link>
              <Link
                href="/register"
                className="rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-1.5 text-xs font-semibold text-white shadow-md shadow-violet-600/30 transition-all hover:opacity-95 hover:shadow-violet-600/50"
              >
                Daftar Akun
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
