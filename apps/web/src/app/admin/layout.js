"use client";

import Sidebar from "@/components/Sidebar";
import RequireRole from "@/components/RequireRole";

export default function AdminLayout({ children }) {
  return (
    <RequireRole roles={["admin", "super_admin"]}>
      <div className="flex min-h-screen bg-ink text-paper">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-5xl px-8 py-10">{children}</div>
        </main>
      </div>
    </RequireRole>
  );
}
