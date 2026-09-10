"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Ticket, Headset } from "lucide-react";
import Mark from "./Mark";
import NotificationBell from "./NotificationBell";
import { useAuth } from "@/lib/auth";

export default function PublicHeader() {
  const { session, logout } = useAuth();
  const pathname = usePathname();

  function handleLogout() {
    logout();
  }

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-ink/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center gap-6 px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <Mark className="h-5 w-8 text-gold" />
          <span className="font-display text-lg tracking-tight text-paper">OVATION</span>
        </Link>

        <nav className="hidden items-center gap-5 text-sm text-silver sm:flex">
          <Link href="/" className={pathname === "/" ? "text-paper" : "hover:text-paper"}>
            Cari Event
          </Link>
          <Link href="/help" className={pathname === "/help" ? "text-paper" : "hover:text-paper"}>
            Bantuan
          </Link>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {session?.role === "customer" ? (
            <>
              <NotificationBell />
              <Link
                href="/account"
                className="flex items-center gap-1.5 rounded-md px-3 py-2 text-sm text-silver hover:bg-panel-raised hover:text-paper"
              >
                <Ticket size={15} />
                <span className="hidden sm:inline">{session.name.split(" ")[0]}</span>
              </Link>
              <button
                onClick={handleLogout}
                className="rounded-md p-2 text-silver-dim hover:bg-panel-raised hover:text-red"
                aria-label="Keluar"
              >
                <LogOut size={16} />
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-md bg-gold px-4 py-2 text-sm font-medium text-ink hover:opacity-90"
            >
              Masuk
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
