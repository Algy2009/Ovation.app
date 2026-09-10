"use client";

import Sidebar from "@/components/Sidebar";
import RequireRole from "@/components/RequireRole";

export default function SuperAdminLayout({ children }) {
  return (
    <RequireRole roles={["super_admin"]}>
      <div className="flex min-h-screen bg-ink text-paper">
        <Sidebar section="superadmin" />
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-5xl px-8 py-10">{children}</div>
        </main>
      </div>
    </RequireRole>
  );
}
