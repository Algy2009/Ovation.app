"use client";

import { useRef, useState } from "react";
import { Upload, X, Loader2, Image as ImageIcon } from "lucide-react";

export default function ImageUpload({ value, onChange, label = "Poster Konser" }) {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [mode, setMode] = useState("file"); // "file" | "url"

  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError("");

    try {
      const fd = new FormData();
      fd.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: fd,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal mengunggah gambar.");
      }

      onChange(data.url);
    } catch (err) {
      setUploadError(err.message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-silver">{label}</label>
        <div className="flex items-center gap-2 text-xs">
          <button
            type="button"
            onClick={() => setMode("file")}
            className={`px-2 py-0.5 rounded transition-colors ${
              mode === "file" ? "bg-gold/20 text-gold font-medium" : "text-silver-dim hover:text-silver"
            }`}
          >
            Upload File
          </button>
          <span className="text-line">|</span>
          <button
            type="button"
            onClick={() => setMode("url")}
            className={`px-2 py-0.5 rounded transition-colors ${
              mode === "url" ? "bg-gold/20 text-gold font-medium" : "text-silver-dim hover:text-silver"
            }`}
          >
            Input URL
          </button>
        </div>
      </div>

      {value ? (
        <div className="relative overflow-hidden rounded-lg border border-line bg-panel p-2">
          <div className="relative aspect-[16/9] max-h-56 w-full overflow-hidden rounded-md bg-ink">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={value} alt="Preview poster" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => onChange("")}
              className="absolute right-2 top-2 rounded-full bg-ink/80 p-1.5 text-paper hover:bg-red transition-colors shadow"
              title="Hapus gambar"
            >
              <X size={14} />
            </button>
          </div>
          <p className="mt-2 truncate px-1 text-xs text-silver-dim font-mono">{value}</p>
        </div>
      ) : (
        <div>
          {mode === "file" ? (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                onChange={handleFileChange}
                className="hidden"
                id="poster-file-input"
              />
              <label
                htmlFor="poster-file-input"
                className="flex flex-col items-center justify-center gap-2.5 rounded-lg border-2 border-dashed border-line bg-panel/50 p-6 text-center cursor-pointer transition-colors hover:border-gold/50 hover:bg-panel"
              >
                {uploading ? (
                  <>
                    <Loader2 size={24} className="animate-spin text-gold" />
                    <span className="text-xs text-silver">Mengunggah gambar…</span>
                  </>
                ) : (
                  <>
                    <div className="rounded-full bg-panel-raised p-2.5 text-gold">
                      <Upload size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-paper">
                        Klik untuk memilih gambar poster dari perangkat
                      </p>
                      <p className="mt-1 text-[11px] text-silver-dim">
                        Mendukung JPG, PNG, atau WebP (Maksimal 5MB)
                      </p>
                    </div>
                  </>
                )}
              </label>
            </div>
          ) : (
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 rounded-md border border-line bg-panel px-3 py-2">
                <ImageIcon size={16} className="text-silver-dim shrink-0" />
                <input
                  type="url"
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  placeholder="https://contoh.com/poster.jpg atau /images/events/..."
                  className="w-full bg-transparent text-sm text-paper placeholder:text-silver-dim focus:outline-none"
                />
              </div>
              <span className="text-[11px] text-silver-dim block">
                Masukkan URL langsung ke gambar poster konser.
              </span>
            </div>
          )}
        </div>
      )}

      {uploadError && <p className="text-xs text-red">{uploadError}</p>}
    </div>
  );
}
