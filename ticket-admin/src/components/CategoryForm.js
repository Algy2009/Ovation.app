"use client";

import { useState } from "react";

const EMPTY = { name: "", price: "", quota: "" };

export default function CategoryForm({ initial, onSubmit, onCancel, submitLabel }) {
  const [form, setForm] = useState(
    initial
      ? { name: initial.name, price: String(initial.price), quota: String(initial.quota) }
      : EMPTY
  );
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const price = Number(form.price);
    const quota = Number(form.quota);
    if (!form.name.trim() || !(price >= 0) || !(quota >= 0)) {
      setError("Nama, harga, dan kuota harus terisi dengan benar.");
      return;
    }
    if (initial && quota < initial.sold) {
      setError(`Kuota tidak boleh kurang dari ${initial.sold} tiket yang sudah terjual.`);
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit({ name: form.name.trim(), price, quota });
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-[1fr_140px_120px_auto] items-start gap-3 rounded-md border border-line bg-panel-raised/60 px-4 py-3"
    >
      <input
        autoFocus
        value={form.name}
        onChange={(e) => set("name", e.target.value)}
        placeholder="Nama kategori, cth. VIP"
        className={inputClass}
      />
      <input
        value={form.price}
        onChange={(e) => set("price", e.target.value.replace(/[^0-9]/g, ""))}
        placeholder="Harga (Rp)"
        inputMode="numeric"
        className={inputClass}
      />
      <input
        value={form.quota}
        onChange={(e) => set("quota", e.target.value.replace(/[^0-9]/g, ""))}
        placeholder="Kuota"
        inputMode="numeric"
        className={inputClass}
      />
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-gold px-3 py-2 text-sm font-medium text-ink transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {submitting ? "Menyimpan…" : submitLabel}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-line px-3 py-2 text-sm text-silver-dim hover:text-silver"
        >
          Batal
        </button>
      </div>
      {error && <p className="col-span-4 text-sm text-red">{error}</p>}
    </form>
  );
}

const inputClass =
  "w-full rounded-md border border-line bg-panel px-3 py-2 text-sm text-paper placeholder:text-silver-dim focus:border-gold focus:outline-none";
