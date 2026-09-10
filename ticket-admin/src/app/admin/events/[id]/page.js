"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useData } from "@/lib/store";
import { formatDate, formatIDR } from "@/lib/format";
import { GENRES } from "@/lib/data";
import QuotaBar from "@/components/QuotaBar";
import CategoryForm from "@/components/CategoryForm";
import EventPoster from "@/components/EventPoster";
import ImageUpload from "@/components/ImageUpload";
import { ArrowLeft, PlusCircle, Pencil, Trash2, X } from "lucide-react";

export default function EventDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { getEvent, updateEvent, deleteEvent, addCategory, updateCategory, deleteCategory, loading } = useData();

  const [addingCategory, setAddingCategory] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [editingEvent, setEditingEvent] = useState(false);
  const [form, setForm] = useState(null);
  const [error, setError] = useState("");

  if (loading) return <p className="text-silver-dim">Memuat data…</p>;

  const event = getEvent(id);
  if (!event) {
    return (
      <div>
        <p className="text-silver-dim">Event tidak ditemukan.</p>
        <Link href="/admin/events" className="mt-2 inline-block text-sm text-gold">Kembali ke daftar event</Link>
      </div>
    );
  }

  const sold = event.categories.reduce((n, c) => n + c.sold, 0);
  const quota = event.categories.reduce((n, c) => n + c.quota, 0);
  const revenue = event.categories.reduce((n, c) => n + c.sold * c.price, 0);

  function startEdit() {
    setForm({ ...event });
    setEditingEvent(true);
  }

  async function saveEdit(e) {
    e.preventDefault();
    try {
      await updateEvent(event.id, { ...form, purchaseLimit: Number(form.purchaseLimit) || 1 });
      setEditingEvent(false);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDeleteEvent() {
    if (confirm(`Hapus "${event.name}"? Tindakan ini tidak bisa dibatalkan.`)) {
      await deleteEvent(event.id);
      router.push("/admin/events");
    }
  }

  async function toggleStatus() {
    try {
      await updateEvent(event.id, { status: event.status === "published" ? "draft" : "published" });
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div>
      <Link href="/admin/events" className="flex items-center gap-1 text-sm text-silver-dim hover:text-silver">
        <ArrowLeft size={14} /> Event & tiket
      </Link>

      {editingEvent ? (
        <form onSubmit={saveEdit} className="mt-4 max-w-2xl space-y-5 rounded-lg border border-line bg-panel p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl text-paper">Edit event</h2>
            <button type="button" onClick={() => setEditingEvent(false)} className="text-silver-dim hover:text-paper">
              <X size={18} />
            </button>
          </div>

          <Field label="Nama event">
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} />
          </Field>
          <ImageUpload
            value={form.poster || ""}
            onChange={(val) => setForm({ ...form, poster: val })}
            label="Poster Konser (untuk Aplikasi Mobile)"
          />
          <div className="grid grid-cols-2 gap-4">
            <Field label="Venue">
              <input value={form.venue} onChange={(e) => setForm({ ...form, venue: e.target.value })} className={inputClass} />
            </Field>
            <Field label="Kota">
              <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className={inputClass} />
            </Field>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Field label="Tanggal">
              <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className={inputClass} />
            </Field>
            <Field label="Jam">
              <input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} className={inputClass} />
            </Field>
            <Field label="Genre">
              <select value={form.genre} onChange={(e) => setForm({ ...form, genre: e.target.value })} className={inputClass}>
                {GENRES.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Deskripsi">
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} className={inputClass} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Batas pembelian per transaksi">
              <input type="number" min="1" value={form.purchaseLimit} onChange={(e) => setForm({ ...form, purchaseLimit: e.target.value })} className={inputClass} />
            </Field>
            <label className="flex items-center gap-2 self-end rounded-md border border-line px-3 py-2.5">
              <input type="checkbox" checked={!!form.highDemand} onChange={(e) => setForm({ ...form, highDemand: e.target.checked })} className="h-4 w-4 accent-[#E4A92C]" />
              <span className="text-sm text-silver">Aktifkan antrian virtual</span>
            </label>
          </div>
          <div className="flex gap-3">
            <button type="submit" className="rounded-md bg-gold px-5 py-2.5 text-sm font-medium text-ink hover:opacity-90">Simpan perubahan</button>
            <button type="button" onClick={() => setEditingEvent(false)} className="text-sm text-silver-dim hover:text-silver">Batal</button>
          </div>
          {error && <p className="text-sm text-red">{error}</p>}
        </form>
      ) : (
        <div className="mt-4 flex items-start gap-6">
          <div className="w-52 shrink-0 overflow-hidden rounded-lg border border-line bg-ink shadow-sm">
            <EventPoster event={event} className="aspect-[16/9] w-full object-cover" />
          </div>

          <div className="flex-1">
            <div className="flex items-start justify-between gap-6">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-display text-3xl tracking-tight text-paper">{event.name}</h1>
                  <span className={`rounded-full px-2 py-0.5 text-[11px] ${event.status === "published" ? "bg-gold/15 text-gold" : "bg-silver-dim/15 text-silver-dim"}`}>
                    {event.status === "published" ? "Tayang" : "Draf"}
                  </span>
                  {event.highDemand && (
                    <span className="rounded-full bg-red/15 px-2 py-0.5 text-[11px] text-red">Antrian virtual aktif</span>
                  )}
                </div>
                <p className="mt-1 text-sm text-silver-dim">
                  {event.venue}, {event.city} · {formatDate(event.date)}{event.time ? `, ${event.time}` : ""} · {event.genre}
                </p>
                <p className="mt-1 text-xs text-silver-dim">Batas pembelian: {event.purchaseLimit} tiket / transaksi</p>
                {event.description && <p className="mt-3 max-w-xl text-sm text-silver">{event.description}</p>}
              </div>

              <div className="flex shrink-0 flex-col items-end gap-2">
                <button onClick={startEdit} className="flex items-center gap-1.5 rounded-md border border-line px-3 py-2 text-sm text-silver hover:border-gold hover:text-gold">
                  <Pencil size={14} /> Edit
                </button>
                <button
                  onClick={toggleStatus}
                  className="rounded-md border border-line px-3 py-2 text-sm text-silver hover:border-gold hover:text-gold"
                >
                  {event.status === "published" ? "Jadikan draf" : "Tayangkan"}
                </button>
                <button onClick={handleDeleteEvent} className="flex items-center gap-1 text-xs text-silver-dim hover:text-red">
                  <Trash2 size={12} /> Hapus event
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 grid grid-cols-3 gap-px overflow-hidden rounded-lg border border-line bg-line">
        <div className="bg-panel px-5 py-4">
          <p className="text-sm text-silver-dim">Total kuota</p>
          <p className="mt-1 font-display text-2xl text-paper">{quota.toLocaleString("id-ID")}</p>
        </div>
        <div className="bg-panel px-5 py-4">
          <p className="text-sm text-silver-dim">Tiket terjual</p>
          <p className="mt-1 font-display text-2xl text-paper">{sold.toLocaleString("id-ID")}</p>
        </div>
        <div className="bg-panel px-5 py-4">
          <p className="text-sm text-silver-dim">Pendapatan</p>
          <p className="mt-1 font-display text-2xl text-paper">{formatIDR(revenue)}</p>
        </div>
      </div>

      <div className="mt-10 flex items-center justify-between">
        <h2 className="font-display text-xl tracking-tight text-paper">Kategori tiket</h2>
        {!addingCategory && (
          <button onClick={() => setAddingCategory(true)} className="flex items-center gap-2 rounded-md border border-line px-3 py-1.5 text-sm text-silver hover:border-gold hover:text-gold">
            <PlusCircle size={15} /> Tambah kategori
          </button>
        )}
      </div>

      <div className="mt-4 space-y-3">
        {event.categories.length === 0 && !addingCategory && (
          <p className="rounded-lg border border-dashed border-line px-5 py-6 text-center text-sm text-silver-dim">
            Belum ada kategori tiket. Tambahkan minimal satu kategori sebelum event ditayangkan.
          </p>
        )}

        {event.categories.map((c) =>
          editingCategoryId === c.id ? (
            <CategoryForm
              key={c.id}
              initial={c}
              submitLabel="Simpan"
              onCancel={() => setEditingCategoryId(null)}
              onSubmit={async (patch) => {
                await updateCategory(event.id, c.id, patch);
                setEditingCategoryId(null);
              }}
            />
          ) : (
            <div key={c.id} className="flex items-center gap-6 rounded-md border border-line bg-panel px-4 py-3.5">
              <div className="w-40 shrink-0">
                <p className="text-sm font-medium text-paper">{c.name}</p>
                <p className="text-xs text-silver-dim">{formatIDR(c.price)}</p>
              </div>
              <QuotaBar sold={c.sold} quota={c.quota || 1} className="flex-1" />
              <div className="flex shrink-0 gap-1">
                <button onClick={() => setEditingCategoryId(c.id)} className="rounded p-2 text-silver-dim hover:bg-panel-raised hover:text-gold" aria-label={`Edit ${c.name}`}>
                  <Pencil size={14} />
                </button>
                <button
                  onClick={async () => {
                    if (c.sold > 0) { alert("Kategori dengan tiket terjual tidak bisa dihapus."); return; }
                    if (confirm(`Hapus kategori "${c.name}"?`)) {
                      try {
                        await deleteCategory(event.id, c.id);
                      } catch (err) {
                        alert(err.message);
                      }
                    }
                  }}
                  className="rounded p-2 text-silver-dim hover:bg-panel-raised hover:text-red"
                  aria-label={`Hapus ${c.name}`}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          )
        )}

        {addingCategory && (
          <CategoryForm
            submitLabel="Tambah"
            onCancel={() => setAddingCategory(false)}
            onSubmit={async (category) => {
              await addCategory(event.id, category);
              setAddingCategory(false);
            }}
          />
        )}
      </div>
    </div>
  );
}

const inputClass =
  "w-full rounded-md border border-line bg-panel-raised px-3 py-2.5 text-sm text-paper placeholder:text-silver-dim focus:border-gold focus:outline-none";

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm text-silver">{label}</span>
      {children}
    </label>
  );
}
