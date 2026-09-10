"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn, getSession } from "next-auth/react";
import Mark from "@/components/Mark";

function roleHome(role) {
  if (role === "admin") return "/admin";
  if (role === "super_admin") return "/superadmin";
  return "/";
}

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password) {
      setError("Email dan kata sandi wajib diisi.");
      return;
    }
    setSubmitting(true);
    const result = await signIn("credentials", { email: email.trim(), password, redirect: false });
    setSubmitting(false);

    if (result?.error) {
      setError("Email atau kata sandi salah.");
      return;
    }

    const session = await getSession();
    const next = params.get("next");
    router.push(next || roleHome(session?.user?.role));
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-2">
          <Mark className="h-7 w-10 text-gold" />
          <span className="font-display text-2xl tracking-tight text-paper">OVATION</span>
        </div>
        <p className="mt-2 text-center text-sm text-silver-dim">Masuk untuk melanjutkan.</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4 rounded-lg border border-line bg-panel p-6">
          <label className="block">
            <span className="mb-1.5 block text-sm text-silver">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="kamu@email.com"
              className="w-full rounded-md border border-line bg-panel-raised px-3 py-2.5 text-sm text-paper placeholder:text-silver-dim focus:border-gold focus:outline-none"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm text-silver">Kata sandi</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-md border border-line bg-panel-raised px-3 py-2.5 text-sm text-paper placeholder:text-silver-dim focus:border-gold focus:outline-none"
            />
          </label>

          {error && <p className="text-sm text-red">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-md bg-gold px-4 py-2.5 text-sm font-medium text-ink transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {submitting ? "Memeriksa…" : "Masuk"}
          </button>
        </form>

        <div className="mt-4 rounded-lg border border-dashed border-line bg-panel/50 p-4 text-xs text-silver-dim">
          <p className="mb-1.5 font-medium text-silver">Akun demo</p>
          <p>Admin: admin@ovation.id / admin123</p>
          <p>Super Admin: superadmin@ovation.id / super123</p>
          <p>Customer: dinda@example.com / customer123</p>
        </div>

        <p className="mt-4 text-center text-sm text-silver-dim">
          Belum punya akun?{" "}
          <Link href="/register" className="text-gold hover:opacity-80">
            Daftar sebagai customer
          </Link>
        </p>
        <Link href="/" className="mt-2 block text-center text-sm text-silver-dim hover:text-silver">
          Kembali ke beranda
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
