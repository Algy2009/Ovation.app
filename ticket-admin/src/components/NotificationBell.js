"use client";

import { useState } from "react";
import { Bell } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useData } from "@/lib/store";

function timeAgo(iso) {
  return new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }).format(
    new Date(iso)
  );
}

export default function NotificationBell() {
  const { session } = useAuth();
  const { getNotificationsFor, markNotificationsRead } = useData();
  const [open, setOpen] = useState(false);

  if (!session) return null;

  const notifications = getNotificationsFor(session.email);
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div className="relative">
      <button
        onClick={() => {
          setOpen((v) => !v);
          if (unread > 0) markNotificationsRead(session.email).catch(() => {});
        }}
        className="relative rounded-md p-2 text-silver hover:bg-panel-raised hover:text-paper"
        aria-label="Notifikasi"
      >
        <Bell size={18} />
        {unread > 0 && (
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-gold" />
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-20 mt-2 w-80 rounded-lg border border-line bg-panel shadow-lg">
            <div className="border-b border-line px-4 py-3">
              <p className="text-sm font-medium text-paper">Notifikasi</p>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 && (
                <p className="px-4 py-6 text-center text-sm text-silver-dim">Belum ada notifikasi.</p>
              )}
              {notifications.map((n) => (
                <div key={n.id} className="border-b border-line px-4 py-3 last:border-0">
                  <p className="text-sm text-silver">{n.message}</p>
                  <p className="mt-1 text-[11px] text-silver-dim">{timeAgo(n.createdAt)}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
