"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn, getSession } from "next-auth/react";
import { Sparkles, ArrowRight, ShieldCheck, UserCheck, Ticket } from "lucide-react";

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

  async function handleLogin(targetEmail, targetPassword) {
    const finalEmail = targetEmail || email;
    const finalPassword = targetPassword || password;

    setError("");
    if (!finalEmail.trim() || !finalPassword) {
      setError("Email dan kata sandi wajib diisi.");
      return;
    }

    setSubmitting(true);
    const result = await signIn("credentials", {
      email: finalEmail.trim(),
      password: finalPassword,
      redirect: false,
    });
    setSubmitting(false);

    if (result?.error) {
      setError("Email atau kata sandi tidak valid.");
      return;
    }

    const session = await getSession();
    const next = params.get("next");
    router.push(next || roleHome(session?.user?.role));
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-amber-500 shadow-xl shadow-violet-600/30">
            <Sparkles size={24} className="text-white" />
          </div>
          <h2 className="mt-4 text-2xl font-black text-white">Selamat Datang di Ovation</h2>
          <p className="mt-1 text-xs text-slate-400">Masuk untuk mengelola event, bertransaksi, atau mengakses e-ticket.</p>
        </div>

        {/* Login Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleLogin();
          }}
          className="glass-panel mt-6 space-y-4 rounded-3xl border border-white/10 bg-[#12141F] p-7 shadow-2xl shadow-violet-950/40"
        >
          <div>
            <label className="block text-xs font-semibold text-slate-300">Email Akun</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@email.com"
              className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:border-violet-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300">Kata Sandi</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:border-violet-500 focus:outline-none"
            />
          </div>

          {error && <p className="text-xs text-rose-400">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 py-3 text-xs font-bold text-white shadow-lg shadow-violet-600/30 transition-all hover:opacity-95 disabled:opacity-50"
          >
            {submitting ? "Memverifikasi..." : "Masuk ke Akun"}
            <ArrowRight size={14} />
          </button>
        </form>

        {/* 1-Click Demo Accounts */}
        <div className="mt-6 rounded-3xl border border-white/10 bg-[#12141F]/80 p-5 backdrop-blur-md">
          <p className="text-[11px] font-bold uppercase tracking-wider text-amber-400 mb-3 text-center">
            ⚡ Quick Demo Logins (1-Click)
          </p>

          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => {
                setEmail("superadmin@ovation.id");
                setPassword("super123");
                handleLogin("superadmin@ovation.id", "super123");
              }}
              className="flex flex-col items-center gap-1 rounded-xl border border-purple-500/20 bg-purple-500/10 p-2 text-center transition-all hover:bg-purple-500/20"
            >
              <ShieldCheck size={16} className="text-purple-400" />
              <span className="text-[11px] font-bold text-white">Super Admin</span>
              <span className="text-[9px] text-slate-400">Governance</span>
            </button>

            <button
              onClick={() => {
                setEmail("admin@ovation.id");
                setPassword("admin123");
                handleLogin("admin@ovation.id", "admin123");
              }}
              className="flex flex-col items-center gap-1 rounded-xl border border-amber-500/20 bg-amber-500/10 p-2 text-center transition-all hover:bg-amber-500/20"
            >
              <UserCheck size={16} className="text-amber-400" />
              <span className="text-[11px] font-bold text-white">Promotor</span>
              <span className="text-[9px] text-slate-400">Antara Suara</span>
            </button>

            <button
              onClick={() => {
                setEmail("dinda@example.com");
                setPassword("customer123");
                handleLogin("dinda@example.com", "customer123");
              }}
              className="flex flex-col items-center gap-1 rounded-xl border border-violet-500/20 bg-violet-500/10 p-2 text-center transition-all hover:bg-violet-500/20"
            >
              <Ticket size={16} className="text-violet-400" />
              <span className="text-[11px] font-bold text-white">Customer</span>
              <span className="text-[9px] text-slate-400">Dinda Ayu</span>
            </button>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          Belum punya akun?{" "}
          <Link href="/register" className="font-semibold text-amber-400 hover:underline">
            Daftar Akun Baru
          </Link>
        </p>

        <Link href="/" className="mt-2 block text-center text-xs text-slate-400 hover:text-white">
          ← Kembali ke Beranda
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
