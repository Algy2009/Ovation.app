"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import Mark from "@/components/Mark";

function RegisterForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const body = await res.json().catch(() => ({}));

    if (!res.ok) {
      setError(body.error || "Gagal mendaftar. Coba lagi.");
      setSubmitting(false);
      return;
    }

    const result = await signIn("credentials", {
      email: form.email.trim(),
      password: form.password,
      redirect: false,
    });
    setSubmitting(false);

    if (result?.error) {
      router.push("/login");
      return;
    }
    router.push(params.get("next") || "/");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-2">
          <Mark className="h-7 w-10 text-gold" />
          <span className="font-display text-2xl tracking-tight text-paper">OVATION</span>
        </div>
        <p className="mt-2 text-center text-sm text-silver-dim">Buat akun customer baru.</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4 rounded-lg border border-line bg-panel p-6">
          <label className="block">
            <span className="mb-1.5 block text-sm text-silver">Nama</span>
            <input
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="Nama kamu"
              className="w-full rounded-md border border-line bg-panel-raised px-3 py-2.5 text-sm text-paper placeholder:text-silver-dim focus:border-gold focus:outline-none"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm text-silver">Email</span>
            <input
              type="email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              placeholder="kamu@email.com"
              className="w-full rounded-md border border-line bg-panel-raised px-3 py-2.5 text-sm text-paper placeholder:text-silver-dim focus:border-gold focus:outline-none"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm text-silver">Kata sandi</span>
            <input
              type="password"
              value={form.password}
              onChange={(e) => set("password", e.target.value)}
              placeholder="Minimal 6 karakter"
              className="w-full rounded-md border border-line bg-panel-raised px-3 py-2.5 text-sm text-paper placeholder:text-silver-dim focus:border-gold focus:outline-none"
            />
          </label>

          {error && <p className="text-sm text-red">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-md bg-gold px-4 py-2.5 text-sm font-medium text-ink transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {submitting ? "Mendaftarkan…" : "Daftar"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-silver-dim">
          Sudah punya akun?{" "}
          <Link href="/login" className="text-gold hover:opacity-80">
            Masuk
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterForm />
    </Suspense>
  );
}
