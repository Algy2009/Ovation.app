"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

export default function RequireRole({ roles, children }) {
  const { session, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!session || !roles.includes(session.role)) {
      router.replace(`/login?next=${encodeURIComponent(window.location.pathname)}`);
    }
  }, [loading, session, roles, router]);

  if (loading || !session || !roles.includes(session.role)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink">
        <p className="text-sm text-silver-dim">Memeriksa akses…</p>
      </div>
    );
  }

  return children;
}
