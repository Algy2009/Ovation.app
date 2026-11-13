"use client";

import { useEffect, useRef, useState } from "react";
import {
  QrCode,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Camera,
  RefreshCw,
  Clock,
  User,
  CheckCircle2,
  XCircle,
  Hash,
  Download,
} from "lucide-react";

export default function GateScannerPage() {
  const [ticketInput, setTicketInput] = useState("");
  const [gateName, setGateName] = useState("Main Gate VIP A");
  const [loading, setLoading] = useState(false);
  const [lastResult, setLastResult] = useState(null);
  const [recentScans, setRecentScans] = useState([]);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const inputRef = useRef(null);

  // Auto focus barcode input
  useEffect(() => {
    inputRef.current?.focus();
  }, [lastResult]);

  // Handle camera start/stop
  async function toggleCamera() {
    if (isCameraActive) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      setIsCameraActive(false);
      return;
    }

    setCameraError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsCameraActive(true);
    } catch (err) {
      setCameraError("Kamera tidak dapat diakses atau diblokir oleh browser.");
      setIsCameraActive(false);
    }
  }

  // Barcode / QR validation submission
  async function handleValidate(rawCode) {
    const code = (rawCode || ticketInput).trim();
    if (!code) return;

    setLoading(true);

    // Extract ticketCode and dynamicQrToken
    // Dynamic token format: TKT-XXX-YYY-ZZZZZ-HMAC8
    // If input is just token, ticketCode is token without the last 9 chars (-HMAC)
    let ticketCode = code;
    let dynamicQrToken = code;

    const parts = code.split("-");
    if (parts.length >= 4) {
      // It's a full dynamic token
      dynamicQrToken = code;
      // ticketCode is all parts except the last HMAC part
      ticketCode = parts.slice(0, parts.length - 1).join("-");
    }

    try {
      const res = await fetch("/api/checkin/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticketCode,
          dynamicQrToken,
          gateName,
        }),
      });

      const data = await res.json();
      const resultObj = {
        timestamp: new Date().toLocaleTimeString("id-ID"),
        code: ticketCode,
        status: data.status,
        valid: data.valid,
        message: data.message,
        ticket: data.ticket,
      };

      setLastResult(resultObj);
      setRecentScans((prev) => [resultObj, ...prev.slice(0, 19)]);
      setTicketInput("");
    } catch (err) {
      setLastResult({
        timestamp: new Date().toLocaleTimeString("id-ID"),
        code: ticketCode,
        status: "NETWORK_ERROR",
        valid: false,
        message: "Gagal menghubungi server validasi.",
      });
    } finally {
      setLoading(false);
    }
  }

  function exportScanLogsCsv() {
    if (recentScans.length === 0) return;
    const header = ["Waktu", "Kode Tiket", "Pengunjung", "Gerbang", "Status", "Keterangan"];
    const lines = recentScans.map((s) => [
      s.timestamp,
      s.code,
      s.attendee || "-",
      s.gate,
      s.status,
      `"${s.message?.replace(/"/g, '""') || ""}"`,
    ].join(","));
    const csv = [header.join(","), ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `scan-logs-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-white/5">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-violet-500/10 border border-violet-500/30 px-3 py-1 text-xs font-semibold text-violet-300 mb-2">
            <QrCode size={13} className="text-amber-400" />
            Gate Turnstile Admission
          </div>
          <h1 className="text-3xl font-black text-white">Scanner Pintu Masuk (Check-in)</h1>
          <p className="mt-1 text-xs text-slate-400">
            Validasi dynamic QR 30-detik penonton dan cegah tiket palsu atau duplikat secara real-time.
          </p>
        </div>

        {/* Gate Selector */}
        <div className="flex items-center gap-2 bg-[#12141F] border border-white/10 rounded-2xl px-4 py-2">
          <span className="text-xs text-slate-400 font-medium">Gerbang:</span>
          <select
            value={gateName}
            onChange={(e) => setGateName(e.target.value)}
            className="bg-transparent text-xs font-bold text-amber-400 focus:outline-none"
          >
            <option value="Main Gate VIP A" className="bg-[#12141F] text-white">Main Gate VIP A</option>
            <option value="Festival Gate Barat" className="bg-[#12141F] text-white">Festival Gate Barat</option>
            <option value="Tribune Gate Timur" className="bg-[#12141F] text-white">Tribune Gate Timur</option>
            <option value="Fast Track VIP Gate" className="bg-[#12141F] text-white">Fast Track VIP Gate</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Scanner Inputs & Camera */}
        <div className="space-y-6">
          {/* Manual / Barcode Gun Input */}
          <div className="glass-panel rounded-3xl border border-white/10 bg-[#12141F] p-6">
            <h2 className="text-sm font-bold text-white mb-2">Input Barcode Scanner / PDA Gun</h2>
            <p className="text-xs text-slate-400 mb-4">
              Arahkan scanner hardware barcode ke QR code penonton atau ketik token dinamis di bawah.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleValidate();
              }}
              className="flex gap-2"
            >
              <div className="relative flex-1">
                <input
                  ref={inputRef}
                  type="text"
                  value={ticketInput}
                  onChange={(e) => setTicketInput(e.target.value)}
                  placeholder="Scan atau tempel Dynamic QR Token (cth: TKT-DEW-FES-48A2-9F1C)..."
                  className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-xs text-white placeholder:text-slate-500 focus:border-violet-500 focus:outline-none font-mono"
                />
              </div>
              <button
                type="submit"
                disabled={loading || !ticketInput.trim()}
                className="rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-3 text-xs font-bold text-white shadow-lg shadow-violet-600/30 transition-all hover:opacity-95 disabled:opacity-50"
              >
                {loading ? <RefreshCw size={14} className="animate-spin" /> : "Validasi"}
              </button>
            </form>
          </div>

          {/* Camera Scanner View */}
          <div className="glass-panel rounded-3xl border border-white/10 bg-[#12141F] p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold text-white">Scanner Kamera Web / Smartphone</h2>
                <p className="text-xs text-slate-400">Gunakan kamera perangkat untuk memindai QR secara live.</p>
              </div>
              <button
                onClick={toggleCamera}
                className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all ${
                  isCameraActive
                    ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                    : "bg-violet-600 text-white hover:bg-violet-700"
                }`}
              >
                <Camera size={14} />
                {isCameraActive ? "Matikan Kamera" : "Nyalakan Kamera"}
              </button>
            </div>

            {cameraError && (
              <div className="p-3 mb-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
                {cameraError}
              </div>
            )}

            <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-white/10 bg-black/60 flex items-center justify-center">
              <video
                ref={videoRef}
                className={`h-full w-full object-cover ${isCameraActive ? "block" : "hidden"}`}
                playsInline
                muted
              />

              {!isCameraActive && (
                <div className="text-center p-6">
                  <Camera size={36} className="mx-auto text-slate-600 mb-2" />
                  <p className="text-xs text-slate-400">Kamera sedang nonaktif.</p>
                  <p className="text-[11px] text-slate-500 mt-1">Klik tombol &ldquo;Nyalakan Kamera&rdquo; untuk memulai.</p>
                </div>
              )}

              {isCameraActive && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="h-48 w-48 rounded-2xl border-2 border-dashed border-amber-400/80 animate-pulse" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Scan Result Feedback & Log */}
        <div className="space-y-6">
          {/* Main Feedback Banner */}
          {lastResult ? (
            <div
              className={`rounded-3xl border p-6 transition-all shadow-2xl ${
                lastResult.valid
                  ? "border-emerald-500/50 bg-emerald-950/30 shadow-emerald-950/40"
                  : lastResult.status === "ALREADY_CHECKED_IN"
                  ? "border-rose-500/50 bg-rose-950/30 shadow-rose-950/40"
                  : "border-amber-500/50 bg-amber-950/30 shadow-amber-950/40"
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
                    lastResult.valid
                      ? "bg-emerald-500 text-white"
                      : lastResult.status === "ALREADY_CHECKED_IN"
                      ? "bg-rose-500 text-white"
                      : "bg-amber-500 text-white"
                  }`}
                >
                  {lastResult.valid ? (
                    <CheckCircle2 size={28} />
                  ) : lastResult.status === "ALREADY_CHECKED_IN" ? (
                    <ShieldAlert size={28} />
                  ) : (
                    <AlertTriangle size={28} />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      lastResult.valid
                        ? "bg-emerald-500/20 text-emerald-300"
                        : lastResult.status === "ALREADY_CHECKED_IN"
                        ? "bg-rose-500/20 text-rose-300"
                        : "bg-amber-500/20 text-amber-300"
                    }`}
                  >
                    {lastResult.status}
                  </span>

                  <h3 className="mt-2 text-xl font-black text-white">
                    {lastResult.valid
                      ? "AKSES DIIZINKAN (SILAKAN MASUK)"
                      : lastResult.status === "ALREADY_CHECKED_IN"
                      ? "PERINGATAN: TIKET SUDAH PERNAH DIGUNAKAN"
                      : "TIKET DITOLAK / KADALUWARSA"}
                  </h3>
                  <p className="text-xs text-slate-300 mt-1">{lastResult.message}</p>

                  {/* Visitor Profile Info if available */}
                  {lastResult.ticket && (
                    <div className="mt-4 space-y-2 rounded-2xl bg-black/40 p-4 border border-white/5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Nama Pengunjung:</span>
                        <strong className="text-white">{lastResult.ticket.attendeeName}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">NIK (Masked):</span>
                        <strong className="font-mono text-amber-400">
                          ************{lastResult.ticket.attendeeNikLast4}
                        </strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Kategori Tiket:</span>
                        <strong className="text-violet-300">{lastResult.ticket.category}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Konser:</span>
                        <span className="text-slate-200 truncate max-w-[200px]">{lastResult.ticket.event}</span>
                      </div>
                      <div className="flex justify-between border-t border-white/5 pt-2 mt-2">
                        <span className="text-slate-400">Waktu Scan:</span>
                        <span className="text-emerald-400 font-mono font-semibold">
                          {lastResult.ticket.checkedInAt?.slice(11, 19) || lastResult.timestamp}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-white/10 bg-[#12141F]/50 p-12 text-center">
              <QrCode size={40} className="mx-auto text-slate-600 mb-3" />
              <h3 className="text-sm font-bold text-white">Menunggu Pemindaian Tiket</h3>
              <p className="mt-1 text-xs text-slate-400 max-w-xs mx-auto">
                Hasil verifikasi single-use dynamic QR beserta nama dan masked NIK pengunjung akan tampil di sini.
              </p>
            </div>
          )}

          {/* Recent Scans Table */}
          <div className="glass-panel rounded-3xl border border-white/10 bg-[#12141F] p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white">Riwayat Pemindaian Sesi Ini ({recentScans.length})</h3>
              {recentScans.length > 0 && (
                <button
                  onClick={exportScanLogsCsv}
                  className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-slate-300 hover:border-amber-500/40 hover:text-amber-400"
                >
                  <Download size={13} /> Ekspor CSV
                </button>
              )}
            </div>

            <div className="divide-y divide-white/5 max-h-72 overflow-y-auto">
              {recentScans.length === 0 && (
                <p className="py-6 text-center text-xs text-slate-500">Belum ada aktivitas pemindaian.</p>
              )}
              {recentScans.map((s, idx) => (
                <div key={idx} className="flex items-center justify-between py-2.5 text-xs">
                  <div className="flex items-center gap-2">
                    {s.valid ? (
                      <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                    ) : (
                      <XCircle size={14} className="text-rose-400 shrink-0" />
                    )}
                    <div>
                      <p className="font-mono text-white text-[11px]">{s.code}</p>
                      <p className="text-[10px] text-slate-400">
                        {s.ticket?.attendeeName || "Customer"} · {s.timestamp}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`rounded-full px-2 py-0.5 text-[9px] font-semibold ${
                      s.valid ? "bg-emerald-500/20 text-emerald-300" : "bg-rose-500/20 text-rose-300"
                    }`}
                  >
                    {s.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

