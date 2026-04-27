"use client";
import { useState, useRef, useCallback } from "react";
import { Sparkles, Upload, X, Loader2, CheckCircle, AlertCircle, TrendingDown, Star, ChevronDown, ChevronUp, Lightbulb, Tag } from "lucide-react";

interface AnalysisResult {
  kondisi: "Sangat Baik" | "Baik" | "Cukup" | "Kurang Baik";
  skor: number;
  ringkasan: string;
  detail: string[];
  persentase_diskon: number;
  rekomendasi_harga_per_unit: number;
  satuan: string;
  alasan_harga: string;
  tips_penjualan: string;
  total_harga: number | null;
  harga_pasar_acuan: number;
  kategori: string;
}

interface MaterialAnalyzerProps {
  category: string;
  weight: string;
  onApply: (data: { condition: string; price: string; priceUnit: string; description: string }) => void;
}

const KONDISI_CONFIG = {
  "Sangat Baik": { color: "#10b981", bg: "rgba(16,185,129,0.12)", border: "rgba(16,185,129,0.3)", icon: "🟢" },
  "Baik":        { color: "#3b82f6", bg: "rgba(59,130,246,0.12)", border: "rgba(59,130,246,0.3)", icon: "🔵" },
  "Cukup":       { color: "#f59e0b", bg: "rgba(245,158,11,0.12)",  border: "rgba(245,158,11,0.3)",  icon: "🟡" },
  "Kurang Baik": { color: "#ef4444", bg: "rgba(239,68,68,0.12)",   border: "rgba(239,68,68,0.3)",   icon: "🔴" },
};

const CONDITION_MAP: Record<string, string> = {
  "Sangat Baik": "Sangat Baik",
  "Baik":        "Baik",
  "Cukup":       "Cukup",
  "Kurang Baik": "Cukup",
};

export default function MaterialAnalyzer({ category, weight, onApply }: MaterialAnalyzerProps) {
  const [image, setImage]           = useState<File | null>(null);
  const [preview, setPreview]       = useState<string | null>(null);
  const [loading, setLoading]       = useState(false);
  const [result, setResult]         = useState<AnalysisResult | null>(null);
  const [error, setError]           = useState<string | null>(null);
  const [dragging, setDragging]     = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("File harus berupa gambar (JPG, PNG, WEBP).");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("Ukuran gambar maksimal 10 MB.");
      return;
    }
    setImage(file);
    setPreview(URL.createObjectURL(file));
    setResult(null);
    setError(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleAnalyze = async () => {
    if (!image) return;
    if (!category) { setError("Pilih kategori material terlebih dahulu."); return; }

    setLoading(true);
    setError(null);
    setResult(null);

    const fd = new FormData();
    fd.append("image", image);
    fd.append("category", category);
    fd.append("weight", weight || "0");

    try {
      const res = await fetch("/api/analyze-material", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error ?? "Analisis gagal.");
      setResult(data.analysis);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (!result) return;
    onApply({
      condition: CONDITION_MAP[result.kondisi] ?? "Baik",
      price:     String(result.rekomendasi_harga_per_unit),
      priceUnit: result.satuan,
      description: `[AI Analysis] Kondisi: ${result.kondisi} (${result.skor}/10). ${result.ringkasan}`,
    });
  };

  const cfg = result ? (KONDISI_CONFIG[result.kondisi] ?? KONDISI_CONFIG["Baik"]) : null;

  return (
    <div style={{ background: "rgba(99,102,241,0.05)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: "16px", padding: "20px", marginBottom: "20px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
        <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Sparkles size={16} color="white" />
        </div>
        <div>
          <p style={{ fontSize: "14px", fontWeight: 800, color: "#c4b5fd", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>AI Quality Inspector</p>
          <p style={{ fontSize: "11px", color: "#475569" }}>Upload foto material → Gemini AI akan mendeteksi kualitas & merekomendasikan harga</p>
        </div>
      </div>

      {/* Upload Area */}
      {!image ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
          style={{
            border: `2px dashed ${dragging ? "#818cf8" : "rgba(99,102,241,0.3)"}`,
            borderRadius: "12px",
            padding: "32px 16px",
            textAlign: "center",
            cursor: "pointer",
            background: dragging ? "rgba(99,102,241,0.08)" : "rgba(255,255,255,0.02)",
            transition: "all 0.2s",
          }}
        >
          <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
            <Upload size={22} color="#818cf8" />
          </div>
          <p style={{ fontSize: "14px", fontWeight: 700, color: "#c4b5fd", marginBottom: "4px" }}>Upload Foto Material</p>
          <p style={{ fontSize: "12px", color: "#475569" }}>Drag & drop atau klik untuk pilih • JPG, PNG, WEBP • Maks 10MB</p>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }} />
        </div>
      ) : (
        <div style={{ position: "relative", marginBottom: "12px" }}>
          {/* Image preview */}
          <div style={{ borderRadius: "12px", overflow: "hidden", maxHeight: "240px", border: "1px solid rgba(99,102,241,0.25)" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview!} alt="Preview" style={{ width: "100%", height: "240px", objectFit: "cover", display: "block" }} />
          </div>
          {/* Remove button */}
          <button
            type="button"
            onClick={() => { setImage(null); setPreview(null); setResult(null); setError(null); }}
            style={{ position: "absolute", top: "8px", right: "8px", width: "28px", height: "28px", borderRadius: "50%", background: "rgba(0,0,0,0.6)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" }}
          >
            <X size={14} color="white" />
          </button>
          {/* Re-upload */}
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            style={{ position: "absolute", bottom: "8px", right: "8px", display: "flex", alignItems: "center", gap: "5px", padding: "5px 10px", background: "rgba(0,0,0,0.6)", border: "none", borderRadius: "8px", color: "white", fontSize: "11px", cursor: "pointer", backdropFilter: "blur(4px)" }}
          >
            <Upload size={11} /> Ganti
          </button>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }} />
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "10px", padding: "10px 13px", marginTop: "10px" }}>
          <AlertCircle size={14} color="#f87171" style={{ flexShrink: 0 }} />
          <p style={{ fontSize: "12px", color: "#f87171" }}>{error}</p>
        </div>
      )}

      {/* Analyze button */}
      {image && !result && (
        <button
          type="button"
          onClick={handleAnalyze}
          disabled={loading || !category}
          style={{
            width: "100%", marginTop: "12px",
            display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
            padding: "13px",
            background: loading ? "rgba(99,102,241,0.3)" : "linear-gradient(135deg,#6366f1,#8b5cf6)",
            color: "white", border: "none", borderRadius: "12px",
            cursor: loading ? "not-allowed" : "pointer",
            fontSize: "14px", fontWeight: 700,
            boxShadow: loading ? "none" : "0 4px 20px rgba(99,102,241,0.4)",
            transition: "all 0.2s",
            opacity: !category ? 0.5 : 1,
          }}
        >
          {loading ? (
            <><Loader2 size={17} style={{ animation: "spin 1s linear infinite" }} /> Gemini sedang menganalisis...</>
          ) : (
            <><Sparkles size={17} /> Analisis Kualitas dengan AI</>
          )}
        </button>
      )}

      {/* Loading state */}
      {loading && (
        <div style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "8px" }}>
          {["Mendeteksi kondisi visual material...", "Mengevaluasi tingkat keausan & kerusakan...", "Menghitung estimasi harga pasar...", "Menyusun rekomendasi penjualan..."].map((step, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 12px", background: "rgba(255,255,255,0.03)", borderRadius: "8px" }}>
              <Loader2 size={12} color="#818cf8" style={{ animation: "spin 1s linear infinite", animationDelay: `${i * 0.2}s`, flexShrink: 0 }} />
              <span style={{ fontSize: "12px", color: "#64748b" }}>{step}</span>
            </div>
          ))}
        </div>
      )}

      {/* RESULT */}
      {result && cfg && (
        <div style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
          {/* Condition badge + score */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            {/* Kondisi */}
            <div style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, borderRadius: "12px", padding: "14px", textAlign: "center" }}>
              <p style={{ fontSize: "11px", fontWeight: 600, color: "#475569", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "8px" }}>Kondisi Material</p>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                <span style={{ fontSize: "20px" }}>{cfg.icon}</span>
                <span style={{ fontSize: "18px", fontWeight: 900, color: cfg.color, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{result.kondisi}</span>
              </div>
            </div>
            {/* Skor */}
            <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "14px", textAlign: "center" }}>
              <p style={{ fontSize: "11px", fontWeight: 600, color: "#475569", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "8px" }}>Skor Kualitas</p>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: "2px" }}>
                <span style={{ fontSize: "28px", fontWeight: 900, color: cfg.color, fontFamily: "'Plus Jakarta Sans',sans-serif", lineHeight: 1 }}>{result.skor}</span>
                <span style={{ fontSize: "14px", color: "#475569" }}>/10</span>
              </div>
              {/* Score bar */}
              <div style={{ marginTop: "8px", height: "4px", background: "rgba(255,255,255,0.06)", borderRadius: "2px", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${result.skor * 10}%`, background: cfg.color, borderRadius: "2px", transition: "width 0.8s ease" }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "3px" }}>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={10} color={i < Math.round(result.skor / 2) ? cfg.color : "#1e293b"} fill={i < Math.round(result.skor / 2) ? cfg.color : "none"} />
                ))}
              </div>
            </div>
          </div>

          {/* Ringkasan */}
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", padding: "14px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
              <CheckCircle size={13} color="#34d399" />
              <span style={{ fontSize: "11px", fontWeight: 700, color: "#34d399", textTransform: "uppercase", letterSpacing: "0.5px" }}>Ringkasan AI</span>
            </div>
            <p style={{ fontSize: "13px", color: "#cbd5e1", lineHeight: 1.6 }}>{result.ringkasan}</p>
          </div>

          {/* Detail poin (collapsible) */}
          <div style={{ border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", overflow: "hidden" }}>
            <button
              type="button"
              onClick={() => setDetailOpen(!detailOpen)}
              style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: "rgba(255,255,255,0.03)", border: "none", cursor: "pointer" }}
            >
              <span style={{ fontSize: "11px", fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.5px" }}>Detail Observasi</span>
              {detailOpen ? <ChevronUp size={14} color="#475569" /> : <ChevronDown size={14} color="#475569" />}
            </button>
            {detailOpen && (
              <div style={{ padding: "10px 14px", display: "flex", flexDirection: "column", gap: "6px" }}>
                {result.detail.map((poin, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
                    <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: cfg.color, marginTop: "6px", flexShrink: 0 }} />
                    <p style={{ fontSize: "12px", color: "#94a3b8", lineHeight: 1.5 }}>{poin}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Rekomendasi Harga */}
          <div style={{ background: "linear-gradient(135deg, rgba(16,185,129,0.08), rgba(6,182,212,0.08))", border: "1px solid rgba(16,185,129,0.2)", borderRadius: "14px", padding: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "12px" }}>
              <Tag size={14} color="#34d399" />
              <span style={{ fontSize: "12px", fontWeight: 800, color: "#34d399", textTransform: "uppercase", letterSpacing: "0.5px" }}>Rekomendasi Harga AI</span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "12px" }}>
              {/* Harga per unit */}
              <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: "10px", padding: "10px 12px" }}>
                <p style={{ fontSize: "10px", color: "#475569", fontWeight: 600, marginBottom: "4px" }}>HARGA JUAL / UNIT</p>
                <p style={{ fontSize: "18px", fontWeight: 900, color: "#f1f5f9", fontFamily: "'Plus Jakarta Sans',sans-serif", lineHeight: 1 }}>
                  Rp {result.rekomendasi_harga_per_unit.toLocaleString("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <p style={{ fontSize: "10px", color: "#475569", marginTop: "2px" }}>{result.satuan}</p>
              </div>
              {/* Diskon */}
              <div style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.15)", borderRadius: "10px", padding: "10px 12px", textAlign: "center" }}>
                <TrendingDown size={16} color="#10b981" style={{ margin: "0 auto 4px" }} />
                <p style={{ fontSize: "22px", fontWeight: 900, color: "#34d399", fontFamily: "'Plus Jakarta Sans',sans-serif", lineHeight: 1 }}>-{result.persentase_diskon}%</p>
                <p style={{ fontSize: "10px", color: "#475569" }}>dari harga pasar baru</p>
              </div>
            </div>

            {/* Total jika ada berat */}
            {result.total_harga && (
              <div style={{ background: "rgba(16,185,129,0.07)", borderRadius: "8px", padding: "8px 12px", marginBottom: "10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "12px", color: "#64748b" }}>Estimasi total ({weight} ton)</span>
                <span style={{ fontSize: "14px", fontWeight: 800, color: "#34d399" }}>Rp {result.total_harga.toLocaleString("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            )}

            {/* Harga pasar acuan */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
              <span style={{ fontSize: "11px", color: "#334155" }}>Harga pasar baru (acuan)</span>
              <span style={{ fontSize: "11px", color: "#334155", textDecoration: "line-through" }}>Rp {result.harga_pasar_acuan.toLocaleString("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>

            {/* Alasan harga */}
            <div style={{ background: "rgba(0,0,0,0.2)", borderRadius: "8px", padding: "9px 12px", marginBottom: "12px" }}>
              <p style={{ fontSize: "11px", color: "#64748b", lineHeight: 1.5 }}><strong style={{ color: "#94a3b8" }}>💡 Mengapa harga ini?</strong> {result.alasan_harga}</p>
            </div>

            {/* Tips */}
            <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", background: "rgba(245,158,11,0.07)", border: "1px solid rgba(245,158,11,0.15)", borderRadius: "8px", padding: "9px 12px", marginBottom: "14px" }}>
              <Lightbulb size={13} color="#f59e0b" style={{ flexShrink: 0, marginTop: "1px" }} />
              <p style={{ fontSize: "11px", color: "#d97706", lineHeight: 1.5 }}><strong>Tips:</strong> {result.tips_penjualan}</p>
            </div>

            {/* Apply button */}
            <button
              type="button"
              onClick={handleApply}
              style={{
                width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                padding: "12px",
                background: "linear-gradient(135deg,#10b981,#059669)",
                color: "white", border: "none", borderRadius: "10px",
                cursor: "pointer", fontSize: "13px", fontWeight: 700,
                boxShadow: "0 4px 14px rgba(16,185,129,0.35)",
                transition: "all 0.2s",
              }}
            >
              <CheckCircle size={15} />
              Terapkan Kondisi &amp; Harga ke Form
            </button>
          </div>

          {/* Re-analyze */}
          <button
            type="button"
            onClick={handleAnalyze}
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", padding: "8px", background: "transparent", border: "1px solid rgba(99,102,241,0.2)", borderRadius: "8px", color: "#818cf8", cursor: "pointer", fontSize: "12px", fontWeight: 600 }}
          >
            <Sparkles size={12} /> Analisis Ulang
          </button>
        </div>
      )}
    </div>
  );
}
