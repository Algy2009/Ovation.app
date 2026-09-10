"use client";

import { useMemo, useState } from "react";
import { useData } from "@/lib/store";
import { GENRES } from "@/lib/data";
import PublicHeader from "@/components/PublicHeader";
import EventCard from "@/components/EventCard";
import { Search } from "lucide-react";

export default function HomePage() {
  const { events, loading } = useData();
  const [query, setQuery] = useState("");
  const [genre, setGenre] = useState("Semua");

  const published = useMemo(() => events.filter((e) => e.status === "published"), [events]);

  const filtered = useMemo(() => {
    return published.filter((e) => {
      const matchesGenre = genre === "Semua" || e.genre === genre;
      const matchesQuery = `${e.name} ${e.venue} ${e.city}`.toLowerCase().includes(query.toLowerCase());
      return matchesGenre && matchesQuery;
    });
  }, [published, query, genre]);

  return (
    <div className="min-h-screen bg-ink text-paper">
      <PublicHeader />

      <section className="border-b border-line px-6 py-14">
        <div className="mx-auto max-w-6xl">
          <h1 className="max-w-xl font-display text-4xl leading-[0.95] tracking-tight text-paper sm:text-5xl">
            Cari & pesan tiket konser favoritmu.
          </h1>
          <p className="mt-3 max-w-md text-sm text-silver-dim">
            Tanpa antre panjang, tanpa calo — semua tiket resmi dari satu tempat.
          </p>

          <div className="mt-7 flex max-w-lg items-center gap-2 rounded-md border border-line bg-panel px-4 py-3">
            <Search size={18} className="text-silver-dim" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari nama event, venue, atau kota"
              className="w-full bg-transparent text-sm text-paper placeholder:text-silver-dim focus:outline-none"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex flex-wrap gap-2">
          {["Semua", ...GENRES].map((g) => (
            <button
              key={g}
              onClick={() => setGenre(g)}
              className={`rounded-full border px-3.5 py-1.5 text-sm transition-colors ${
                genre === g ? "border-gold bg-gold/10 text-gold" : "border-line text-silver-dim hover:text-silver"
              }`}
            >
              {g}
            </button>
          ))}
        </div>

        <div className="mt-6 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
          {!loading && filtered.length === 0 && (
            <p className="col-span-full py-12 text-center text-sm text-silver-dim">
              Tidak ada event yang cocok. Coba kata kunci atau genre lain.
            </p>
          )}
          {filtered.map((e) => (
            <EventCard key={e.id} event={e} />
          ))}
        </div>
      </section>
    </div>
  );
}
