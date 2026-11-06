"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useData } from "@/lib/store";
import { GENRES } from "@/lib/data";
import ImageUpload from "@/components/ImageUpload";
import { ArrowLeft } from "lucide-react";

const EMPTY = {
  name: "",
  venue: "",
  city: "",
  date: "",
  time: "",
  genre: GENRES[0],
  description: "",
  poster: "",
  purchaseLimit: 4,
  highDemand: false,
  status: "draft",
};

export default function NewEventPage() {
  const router = useRouter();
  const { addEvent } = useData();
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState("");

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.venue.trim() || !form.date) {
      setError("Nama event, venue, dan tanggal wajib diisi.");
      return;
    }
    try {
      const id = await addEvent({ ...form, purchaseLimit: Number(form.purchaseLimit) || 4 });
      router.push(`/admin/events/${id}`);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="max-w-2xl">
      <Link href="/admin/events" className="flex items-center gap-1 text-sm text-silver-dim hover:text-silver">
        <ArrowLeft size={14} /> Event & tiket
      </Link>

      <h1 className="mt-4 font-display text-3xl tracking-tight text-paper">Event baru</h1>
      <p className="mt-1 text-sm text-silver-dim">
        Isi detail event. Kategori tiket bisa ditambahkan setelah event dibuat.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <Field label="Nama event">
          <input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="cth. Bassline Festival" className={inputClass} />
        </Field>

        <ImageUpload
          value={form.poster}
          onChange={(val) => set("poster", val)}
          label="Poster Konser (untuk Aplikasi Mobile)"
        />

        <div className="grid grid-cols-2 gap-4">
          <Field label="Venue">
            <input value={form.venue} onChange={(e) => set("venue", e.target.value)} placeholder="cth. GBK Ecopark" className={inputClass} />
          </Field>
          <Field label="Kota">
            <input value={form.city} onChange={(e) => set("city", e.target.value)} placeholder="cth. Jakarta" className={inputClass} />
          </Field>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Field label="Tanggal">
            <input type="date" value={form.date} onChange={(e) => set("date", e.target.value)} className={inputClass} />
          </Field>
          <Field label="Jam">
            <input type="time" value={form.time} onChange={(e) => set("time", e.target.value)} className={inputClass} />
          </Field>
          <Field label="Genre">
            <select value={form.genre} onChange={(e) => set("genre", e.target.value)} className={inputClass}>
              {GENRES.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="Deskripsi">
          <textarea
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            rows={4}
            placeholder="Ceritakan singkat tentang event ini untuk calon penonton."
            className={inputClass}
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Batas pembelian per transaksi">
            <input
              type="number"
              min="1"
              value={form.purchaseLimit}
              onChange={(e) => set("purchaseLimit", e.target.value)}
              className={inputClass}
            />
          </Field>
          <label className="flex items-center gap-2 self-end rounded-md border border-line px-3 py-2.5">
            <input
              type="checkbox"
              checked={form.highDemand}
              onChange={(e) => set("highDemand", e.target.checked)}
              className="h-4 w-4 accent-[#E4A92C]"
            />
            <span className="text-sm text-silver">Aktifkan antrian virtual (demand tinggi)</span>
          </label>
        </div>

        <fieldset>
          <legend className="mb-2 text-sm text-silver">Status</legend>
          <div className="flex gap-2">
            {[
              { key: "draft", label: "Draf — belum tampil ke customer" },
              { key: "published", label: "Tayang — langsung tampil ke customer" },
            ].map((opt) => (
              <button
                type="button"
                key={opt.key}
                onClick={() => set("status", opt.key)}
                className={`flex-1 rounded-md border px-3 py-2.5 text-left text-sm transition-colors ${
                  form.status === opt.key ? "border-gold bg-gold/10 text-paper" : "border-line text-silver-dim hover:text-silver"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </fieldset>

        {error && <p className="text-sm text-red">{error}</p>}

        <div className="flex items-center gap-3 pt-2">
          <button type="submit" className="rounded-md bg-gold px-5 py-2.5 text-sm font-medium text-ink transition-opacity hover:opacity-90">
            Simpan event
          </button>
          <Link href="/admin/events" className="text-sm text-silver-dim hover:text-silver">
            Batal
          </Link>
        </div>
      </form>
    </div>
  );
}

const inputClass =
  "w-full rounded-md border border-line bg-panel px-3 py-2.5 text-sm text-paper placeholder:text-silver-dim focus:border-gold focus:outline-none";

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm text-silver">{label}</span>
      {children}
    </label>
  );
}
