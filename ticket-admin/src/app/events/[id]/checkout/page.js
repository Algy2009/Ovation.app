"use client";

import { Suspense, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useData } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { formatDate, formatIDR } from "@/lib/format";
import PublicHeader from "@/components/PublicHeader";
import RequireRole from "@/components/RequireRole";
import { ArrowLeft, Minus, Plus, CreditCard } from "lucide-react";

function CheckoutBody() {
  const { id } = useParams();
  const params = useSearchParams();
  const router = useRouter();
  const { getEvent, createOrder, loading } = useData();
  const { session } = useAuth();

  const event = getEvent(id);
  const initialCategoryId = params.get("category") || event?.categories[0]?.id;
  const [categoryId, setCategoryId] = useState(initialCategoryId);
  const [qty, setQty] = useState(1);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");

  const category = useMemo(() => event?.categories.find((c) => c.id === categoryId), [event, categoryId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-ink text-paper">
        <PublicHeader />
        <p className="p-10 text-silver-dim">Memuat data…</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-ink text-paper">
        <PublicHeader />
        <p className="p-10 text-silver-dim">Event tidak ditemukan.</p>
      </div>
    );
  }

  const remaining = category ? category.quota - category.sold : 0;
  const maxQty = Math.max(0, Math.min(event.purchaseLimit, remaining));
  const total = category ? category.price * qty : 0;

  async function handlePay() {
    if (!category || qty < 1) return;
    setError("");
    setPlacing(true);
    try {
      const orderId = await createOrder({ eventId: event.id, categoryId: category.id, qty });
      router.push(`/account/tickets/${orderId}`);
    } catch (err) {
      setError(err.message);
      setPlacing(false);
    }
  }

  return (
    <div className="min-h-screen bg-ink text-paper">
      <PublicHeader />
      <div className="mx-auto max-w-2xl px-6 py-8">
        <Link href={`/events/${event.id}`} className="flex items-center gap-1 text-sm text-silver-dim hover:text-silver">
          <ArrowLeft size={14} /> Kembali ke detail event
        </Link>

        <h1 className="mt-4 font-display text-3xl tracking-tight text-paper">Checkout</h1>
        <p className="mt-1 text-sm text-silver-dim">
          {event.name} · {event.venue}, {event.city} · {formatDate(event.date)}
        </p>

        <div className="mt-8 rounded-lg border border-line bg-panel p-5">
          <p className="text-sm text-silver">Kategori tiket</p>
          <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {event.categories.map((c) => {
              const left = c.quota - c.sold;
              return (
                <button
                  key={c.id}
                  disabled={left <= 0}
                  onClick={() => {
                    setCategoryId(c.id);
                    setQty(1);
                  }}
                  className={`rounded-md border px-3.5 py-2.5 text-left text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                    categoryId === c.id ? "border-gold bg-gold/10" : "border-line hover:border-silver-dim"
                  }`}
                >
                  <p className="text-paper">{c.name}</p>
                  <p className="text-xs text-silver-dim">{formatIDR(c.price)} · sisa {left}</p>
                </button>
              );
            })}
          </div>

          <div className="mt-5 flex items-center justify-between border-t border-line pt-5">
            <div>
              <p className="text-sm text-silver">Jumlah tiket</p>
              <p className="text-xs text-silver-dim">Maks. {event.purchaseLimit} tiket per transaksi</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="rounded-md border border-line p-2 text-silver hover:border-gold hover:text-gold"
              >
                <Minus size={14} />
              </button>
              <span className="w-6 text-center font-display text-lg text-paper">{qty}</span>
              <button
                onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
                disabled={qty >= maxQty}
                className="rounded-md border border-line p-2 text-silver hover:border-gold hover:text-gold disabled:opacity-30"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-lg border border-line bg-panel p-5">
          <div className="flex items-center justify-between text-sm">
            <span className="text-silver">Pembeli</span>
            <span className="text-paper">{session.name} · {session.email}</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-sm">
            <span className="text-silver">{category?.name} × {qty}</span>
            <span className="text-paper">{formatIDR(total)}</span>
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-line pt-3 text-sm">
            <span className="font-medium text-paper">Total bayar</span>
            <span className="font-display text-xl text-gold">{formatIDR(total)}</span>
          </div>
        </div>

        <div className="mt-6 rounded-lg border border-dashed border-line bg-panel/50 p-4 text-xs text-silver-dim">
          Metode pembayaran (kartu, e-wallet, VA) akan tersedia setelah integrasi payment gateway.
          Untuk saat ini tombol di bawah menyelesaikan pesanan secara simulasi.
        </div>

        {error && <p className="mt-4 text-sm text-red">{error}</p>}

        <button
          onClick={handlePay}
          disabled={!category || qty < 1 || placing}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-md bg-gold py-3 text-sm font-medium text-ink transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          <CreditCard size={16} /> Bayar (Simulasi) · {formatIDR(total)}
        </button>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <RequireRole roles={["customer"]}>
      <Suspense fallback={null}>
        <CheckoutBody />
      </Suspense>
    </RequireRole>
  );
}
