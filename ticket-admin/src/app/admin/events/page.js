"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useData } from "@/lib/store";
import { formatDate } from "@/lib/format";
import QuotaBar from "@/components/QuotaBar";
import EventPoster from "@/components/EventPoster";
import { Search, PlusCircle } from "lucide-react";

const FILTERS = [
  { key: "all", label: "Semua" },
  { key: "published", label: "Tayang" },
  { key: "draft", label: "Draf" },
];

export default function EventsPage() {
  const { events, loading } = useData();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");

  const filtered = useMemo(() => {
    return events.filter((e) => {
      const matchesFilter = filter === "all" || e.status === filter;
      const matchesQuery = `${e.name} ${e.venue} ${e.city}`
        .toLowerCase()
        .includes(query.toLowerCase());
      return matchesFilter && matchesQuery;
    });
  }, [events, query, filter]);

  return (
    <div>
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-display text-3xl tracking-tight text-paper">Event & tiket</h1>
          <p className="mt-1 text-sm text-silver-dim">
            Kelola daftar event dan kategori tiket masing-masing.
          </p>
        </div>
        <Link
          href="/admin/events/new"
          className="flex items-center gap-2 rounded-md bg-gold px-4 py-2 text-sm font-medium text-ink transition-opacity hover:opacity-90"
        >
          <PlusCircle size={16} />
          Event baru
        </Link>
      </div>

      <div className="mt-6 flex items-center gap-3">
        <div className="flex flex-1 items-center gap-2 rounded-md border border-line bg-panel px-3 py-2">
          <Search size={16} className="text-silver-dim" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari nama event, venue, atau kota"
            className="w-full bg-transparent text-sm text-paper placeholder:text-silver-dim focus:outline-none"
          />
        </div>
        <div className="flex gap-1 rounded-md border border-line bg-panel p-1">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`rounded px-3 py-1.5 text-sm transition-colors ${
                filter === f.key
                  ? "bg-panel-raised text-paper"
                  : "text-silver-dim hover:text-silver"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 divide-y divide-line rounded-lg border border-line bg-panel">
        {!loading && filtered.length === 0 && (
          <p className="px-5 py-8 text-center text-sm text-silver-dim">
            Tidak ada event yang cocok dengan pencarian.
          </p>
        )}
        {filtered.map((e) => {
          const sold = e.categories.reduce((n, c) => n + c.sold, 0);
          const quota = e.categories.reduce((n, c) => n + c.quota, 0);
          return (
            <Link
              key={e.id}
              href={`/admin/events/${e.id}`}
              className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-panel-raised/60"
            >
              <div className="h-12 w-20 shrink-0 overflow-hidden rounded border border-line bg-ink">
                <EventPoster event={e} className="h-full w-full object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-medium text-paper">{e.name}</p>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] ${
                      e.status === "published"
                        ? "bg-gold/15 text-gold"
                        : "bg-silver-dim/15 text-silver-dim"
                    }`}
                  >
                    {e.status === "published" ? "Tayang" : "Draf"}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-silver-dim">
                  {e.venue}, {e.city} · {formatDate(e.date)} · {e.genre}
                </p>
              </div>
              <p className="w-24 shrink-0 text-right text-xs text-silver-dim">
                {e.categories.length} kategori
              </p>
              <QuotaBar sold={sold} quota={quota || 1} className="w-40 shrink-0" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
