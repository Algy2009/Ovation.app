"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { Sparkles, ArrowRight, ShieldCheck } from "lucide-react";

function RegisterForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    nik: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const body = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(body.error || "Gagal mendaftar. Silakan periksa kembali data Anda.");
        setSubmitting(false);
        return;
      }

      // Auto sign in after registration
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
    } catch (err) {
      setError("Terjadi kesalahan jaringan.");
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-amber-500 shadow-xl shadow-violet-600/30">
            <Sparkles size={24} className="text-white" />
          </div>
          <h2 className="mt-4 text-2xl font-black text-white">Daftar Akun Customer</h2>
          <p className="mt-1 text-xs text-slate-400">
            Dapatkan akses pembelian tiket resmi, dynamic QR e-ticket, dan perlindungan anti-calo.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="glass-panel mt-6 space-y-4 rounded-3xl border border-white/10 bg-[#12141F] p-7 shadow-2xl shadow-violet-950/40"
        >
          <div>
            <label className="block text-xs font-semibold text-slate-300">Nama Lengkap (Sesuai KTP)</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="Contoh: Dinda Ayu Saraswati"
              className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:border-violet-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300">Alamat Email</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              placeholder="nama@email.com"
              className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:border-violet-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300">Nomor WhatsApp</label>
            <input
              type="tel"
              required
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
              placeholder="081234567890"
              className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:border-violet-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300">
              NIK KTP (16 Digit) <span className="text-[10px] text-amber-400 font-normal">Terenkripsi AES-256</span>
            </label>
            <input
              type="text"
              maxLength={16}
              value={form.nik}
              onChange={(e) => set("nik", e.target.value)}
              placeholder="3171012304900001"
              className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:border-violet-500 focus:outline-none font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300">Kata Sandi</label>
            <input
              type="password"
              required
              minLength={8}
              value={form.password}
              onChange={(e) => set("password", e.target.value)}
              placeholder="Minimal 8 karakter"
              className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:border-violet-500 focus:outline-none"
            />
          </div>

          {error && <p className="text-xs text-rose-400">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 py-3 text-xs font-bold text-white shadow-lg shadow-violet-600/30 transition-all hover:opacity-95 disabled:opacity-50"
          >
            {submitting ? "Memproses Akun..." : "Buat Akun Sekarang"}
            <ArrowRight size={14} />
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-400">
          Sudah memiliki akun?{" "}
          <Link href="/login" className="font-semibold text-amber-400 hover:underline">
            Masuk ke Akun
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
