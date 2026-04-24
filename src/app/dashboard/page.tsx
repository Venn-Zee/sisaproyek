"use client";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import type { DashboardStats, MonthlyCarbonEntry, CategoryBreakdownEntry, TopCityEntry } from "@/lib/mockData";
import { useEffect, useRef, useState } from "react";
import {
  Leaf, TrendingUp, Users, Package, Globe, BarChart3,
  Download, ArrowUpRight, Building2, Loader2
} from "lucide-react";

// ─── Animated Counter ────────────────────────────────────────────────────────
function AnimatedNum({ end, decimals = 0, prefix = "", suffix = "" }: {
  end: number; decimals?: number; prefix?: string; suffix?: string;
}) {
  const [v, setV] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);
  useEffect(() => {
    started.current = false;
    setV(0);
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true;
        const t0 = performance.now();
        const dur = 1800;
        const tick = (t: number) => {
          const p = Math.min((t - t0) / dur, 1);
          const ease = 1 - Math.pow(1 - p, 4);
          setV(parseFloat((ease * end).toFixed(decimals)));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.2 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [end, decimals]);
  return <span ref={ref}>{prefix}{decimals > 0 ? v.toFixed(decimals) : Math.floor(v).toLocaleString("id-ID")}{suffix}</span>;
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────
function KpiCard({ label, value, suffix, prefix, decimals, color, icon: Icon, delta, sub }: {
  label: string; value: number; suffix?: string; prefix?: string; decimals?: number;
  color: string; icon: React.ElementType; delta: string; sub: string;
}) {
  return (
    <div className="stat-card" style={{ position: "relative", overflow: "hidden" }}>
      <div style={{
        position: "absolute", top: "-30px", right: "-30px",
        width: "100px", height: "100px", borderRadius: "50%",
        background: `radial-gradient(circle, ${color}20, transparent)`,
        pointerEvents: "none",
      }} />
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "16px" }}>
        <div style={{
          width: "44px", height: "44px", borderRadius: "12px",
          background: `${color}18`, border: `1px solid ${color}30`,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Icon size={20} color={color} />
        </div>
        <div style={{
          display: "flex", alignItems: "center", gap: "4px",
          background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)",
          borderRadius: "100px", padding: "3px 8px",
        }}>
          <ArrowUpRight size={11} color="#10b981" />
          <span style={{ fontSize: "11px", color: "#10b981", fontWeight: 700 }}>{delta}</span>
        </div>
      </div>
      <div style={{ fontSize: "32px", fontWeight: 900, color, letterSpacing: "-1px", marginBottom: "4px", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
        <AnimatedNum end={value} decimals={decimals} prefix={prefix} suffix={suffix} />
      </div>
      <p style={{ fontSize: "13px", fontWeight: 700, color: "#f1f5f9", marginBottom: "4px" }}>{label}</p>
      <p style={{ fontSize: "11px", color: "#475569" }}>{sub}</p>
    </div>
  );
}

// ─── Skeleton Block ───────────────────────────────────────────────────────────
function Skeleton({ height, width = "100%" }: { height: string; width?: string }) {
  return (
    <div style={{
      height,
      width,
      background: "rgba(255,255,255,0.05)",
      borderRadius: "10px",
      animation: "pulse 1.5s ease-in-out infinite",
    }} />
  );
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: { value: number; name: string; color: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#111827", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", padding: "12px 16px" }}>
      <p style={{ fontSize: "11px", color: "#64748b", marginBottom: "8px", fontWeight: 600 }}>{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ fontSize: "13px", color: p.color, fontWeight: 700 }}>
          {p.value.toLocaleString("id-ID")} {p.name === "ton" ? "Ton CO₂" : ""}
        </p>
      ))}
    </div>
  );
}

// ─── Dashboard Page ───────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [stats, setStats]                   = useState<DashboardStats | null>(null);
  const [monthlyCarbonData, setMonthly]     = useState<MonthlyCarbonEntry[]>([]);
  const [categoryBreakdown, setCategory]    = useState<CategoryBreakdownEntry[]>([]);
  const [topCities, setTopCities]           = useState<TopCityEntry[]>([]);
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState<string | null>(null);

  const [lastRefresh, setLastRefresh]       = useState(new Date());
  const [exportDone, setExportDone]         = useState(false);

  // ── Fetch dashboard data ──────────────────────────────────────────────────
  const loadData = () => {
    setLoading(true);
    setError(null);

    fetch("/api/dashboard")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(({ stats: s, monthlyCarbonData: m, categoryBreakdown: c, topCities: t }) => {
        setStats(s);
        setMonthly(m);
        setCategory(c);
        setTopCities(t);
        setLastRefresh(new Date());
      })
      .catch((err) => {
        console.error("[Dashboard] fetch error:", err);
        setError("Gagal memuat data dashboard. Periksa koneksi Anda.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, []);

  const handleExport = () => {
    setExportDone(true);
    setTimeout(() => setExportDone(false), 2000);
  };

  return (
    <div style={{ paddingTop: "68px", minHeight: "100vh", background: "var(--bg-primary)" }}>
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "40px 24px" }}>

        {/* ── Header ── */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "40px", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <div className="badge badge-emerald" style={{ marginBottom: "12px" }}>
              <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#10b981", boxShadow: "0 0 6px #10b981", animation: "pulse 2s infinite" }} />
              Live Analytics
            </div>
            <h1 style={{
              fontFamily: "'Plus Jakarta Sans',sans-serif",
              fontSize: "clamp(28px, 4vw, 42px)",
              fontWeight: 900, color: "#f1f5f9",
              letterSpacing: "-1px", marginBottom: "8px",
            }}>
              Impact Dashboard
            </h1>
            <p style={{ fontSize: "14px", color: "#64748b" }}>
              {loading
                ? "Memuat data..."
                : error
                ? "Gagal memuat — coba refresh"
                : `Pantau dampak lingkungan & ekonomi SisaProyek secara real-time. Update terakhir: ${lastRefresh.toLocaleTimeString("id-ID")}`
              }
            </p>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={loadData}
              disabled={loading}
              style={{
                display: "flex", alignItems: "center", gap: "8px",
                padding: "10px 20px",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "10px", color: "#94a3b8",
                fontWeight: 600, fontSize: "13px", cursor: "pointer",
                opacity: loading ? 0.5 : 1,
              }}
            >
              <Loader2 size={14} style={{ animation: loading ? "spin 1s linear infinite" : "none" }} />
              Refresh
            </button>
            <button
              onClick={handleExport}
              id="export-csr-btn"
              style={{
                display: "flex", alignItems: "center", gap: "8px",
                padding: "10px 20px",
                background: exportDone ? "rgba(16,185,129,0.2)" : "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "10px", color: exportDone ? "#34d399" : "#94a3b8",
                fontWeight: 600, fontSize: "13px", cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              <Download size={14} />
              {exportDone ? "CSR Report Diekspor ✓" : "Ekspor Laporan CSR"}
            </button>
          </div>
        </div>

        {/* ── Error Banner ── */}
        {error && (
          <div style={{
            background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)",
            borderRadius: "12px", padding: "16px 20px", marginBottom: "32px",
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <p style={{ fontSize: "13px", color: "#fca5a5" }}>⚠️ {error}</p>
            <button
              onClick={loadData}
              style={{ padding: "6px 16px", background: "rgba(239,68,68,0.2)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "8px", color: "#fca5a5", fontSize: "12px", cursor: "pointer", fontWeight: 600 }}
            >
              Coba Lagi
            </button>
          </div>
        )}

        {/* ── KPI Cards ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px", marginBottom: "40px" }}>
          {loading || !stats ? (
            [1,2,3,4,5,6].map((i) => (
              <div key={i} className="stat-card" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <Skeleton height="44px" width="44px" />
                <Skeleton height="36px" width="60%" />
                <Skeleton height="14px" width="80%" />
                <Skeleton height="11px" width="50%" />
              </div>
            ))
          ) : (
            <>
              <KpiCard label="Total Material Diselamatkan" value={stats.totalWasteSaved} suffix=" Ton" decimals={1} color="#10b981" icon={Leaf} delta="+23% MoM" sub={`dari ${stats.totalListings.toLocaleString("id-ID")} listing aktif`} />
              <KpiCard label="Reduksi Emisi CO₂" value={stats.co2Reduced} suffix=" Ton" decimals={1} color="#06b6d4" icon={Globe} delta="+18% MoM" sub="setara menanam 15.440 pohon" />
              <KpiCard label="Transaksi Berhasil" value={stats.totalTransactions} color="#6366f1" icon={TrendingUp} delta="+31% MoM" sub="nilai total Rp 12,4 Miliar" />
              <KpiCard label="UMKM Terbantu" value={stats.umkmHelped} suffix="+" color="#f59e0b" icon={Users} delta="+15% MoM" sub="hemat 40% biaya bahan baku" />
              <KpiCard label="Kota Aktif" value={stats.activeCities} color="#8b5cf6" icon={Building2} delta="+6 kota" sub="tersebar di 8 provinsi" />
              <KpiCard label="Total Listing" value={stats.totalListings} color="#ec4899" icon={Package} delta="+87 listing/bln" sub="rata-rata 3 listing baru/hari" />
            </>
          )}
        </div>

        {/* ── Charts Row 1 ── */}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "20px", marginBottom: "20px" }}>
          {/* Area Chart — Monthly Carbon */}
          <div className="glass-card" style={{ padding: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
              <div>
                <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#f1f5f9", marginBottom: "4px", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
                  Penghematan CO₂ Bulanan
                </h3>
                <p style={{ fontSize: "12px", color: "#64748b" }}>Ton emisi karbon yang berhasil dikurangi</p>
              </div>
              <div className="badge badge-emerald">
                <TrendingUp size={10} />
                +307% dari Sep 2025
              </div>
            </div>
            {loading ? (
              <Skeleton height="240px" />
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={monthlyCarbonData}>
                  <defs>
                    <linearGradient id="carbonGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="month" tick={{ fill: "#475569", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#475569", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="ton" name="ton" stroke="#10b981" strokeWidth={2.5} fill="url(#carbonGrad)" dot={{ fill: "#10b981", r: 4, strokeWidth: 0 }} activeDot={{ r: 6, fill: "#34d399" }} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Donut — Category Breakdown */}
          <div className="glass-card" style={{ padding: "24px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#f1f5f9", marginBottom: "4px", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
              Breakdown Kategori
            </h3>
            <p style={{ fontSize: "12px", color: "#64748b", marginBottom: "20px" }}>% distribusi material</p>
            {loading ? (
              <>
                <Skeleton height="180px" />
                <div style={{ marginTop: "8px", display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {[1,2,3,4,5,6].map((i) => <Skeleton key={i} height="14px" width="60px" />)}
                </div>
              </>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={categoryBreakdown} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                      {categoryBreakdown.map((entry, i) => (
                        <Cell key={i} fill={entry.color} stroke="transparent" />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: "#111827", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px" }}
                      labelStyle={{ color: "#f1f5f9" }}
                      itemStyle={{ color: "#94a3b8" }}
                      formatter={(v: unknown) => [`${v}%`, ""]}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "8px" }}>
                  {categoryBreakdown.map((c) => (
                    <div key={c.name} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                      <div style={{ width: "8px", height: "8px", borderRadius: "2px", background: c.color }} />
                      <span style={{ fontSize: "10px", color: "#64748b" }}>{c.name} {c.value}%</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── Charts Row 2 ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "40px" }}>
          {/* Bar chart — Top Cities */}
          <div className="glass-card" style={{ padding: "24px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#f1f5f9", marginBottom: "4px", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
              Top Kota — Material Diselamatkan
            </h3>
            <p style={{ fontSize: "12px", color: "#64748b", marginBottom: "20px" }}>Ton CO₂ per kota</p>
            {loading ? (
              <Skeleton height="220px" />
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={topCities} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
                  <XAxis type="number" tick={{ fill: "#475569", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="city" tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} width={60} />
                  <Tooltip
                    contentStyle={{ background: "#111827", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px" }}
                    itemStyle={{ color: "#10b981" }}
                    formatter={(v: unknown) => [`${v} Ton`, "CO₂ Saved"]}
                  />
                  <Bar dataKey="saved" fill="#10b981" radius={[0, 6, 6, 0]}>
                    {topCities.map((_, i) => (
                      <Cell key={i} fill={`rgba(16,185,129,${1 - i * 0.12})`} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Economic Impact Table */}
          <div className="glass-card" style={{ padding: "24px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#f1f5f9", marginBottom: "4px", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
              Dampak Ekonomi
            </h3>
            <p style={{ fontSize: "12px", color: "#64748b", marginBottom: "20px" }}>Nilai penghematan per bulan</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {loading
                ? [1,2,3,4,5].map((i) => <Skeleton key={i} height="48px" />)
                : monthlyCarbonData.slice(-5).map((d) => (
                  <div key={d.month} style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "10px 14px",
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    borderRadius: "10px",
                  }}>
                    <span style={{ fontSize: "13px", color: "#94a3b8", fontWeight: 500 }}>{d.month}</span>
                    <div style={{ textAlign: "right" }}>
                      <p style={{ fontSize: "13px", fontWeight: 700, color: "#10b981" }}>
                        Rp {(d.savings / 1_000_000).toFixed(0)}M
                      </p>
                      <p style={{ fontSize: "10px", color: "#475569" }}>{d.ton} Ton CO₂</p>
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
        </div>

        {/* ── ESG Summary Card ── */}
        <div
          className="glass-card"
          style={{
            padding: "36px",
            background: "linear-gradient(135deg, rgba(16,185,129,0.08), rgba(99,102,241,0.06))",
            border: "1px solid rgba(16,185,129,0.2)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div className="orb orb-emerald" style={{ width: "300px", height: "300px", top: "-150px", right: "50px", opacity: 0.1 }} />
          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
              <div style={{
                width: "48px", height: "48px", borderRadius: "12px",
                background: "rgba(16,185,129,0.2)", border: "1px solid rgba(16,185,129,0.3)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <BarChart3 size={22} color="#10b981" />
              </div>
              <div>
                <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#f1f5f9", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
                  Proyeksi Dampak Tahun Pertama
                </h3>
                <p style={{ fontSize: "12px", color: "#64748b" }}>Berdasarkan tren pertumbuhan Q1 2026</p>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px" }}>
              {[
                { label: "Material Diselamatkan dari TPA", value: "500+ Ton",       sub: "Proyeksi konservatif tahun pertama", color: "#10b981" },
                { label: "Reduksi Emisi Karbon",           value: "200 Ton CO₂",    sub: "Setara emisi 43 mobil/tahun",       color: "#06b6d4" },
                { label: "UMKM yang Terbantu",             value: "50+ Pemborong",  sub: "Hemat budget bahan baku 40%",       color: "#f59e0b" },
                { label: "Nilai Ekonomi Circular",         value: "Rp 50 Miliar",   sub: "Total nilai transaksi proyeksi",    color: "#8b5cf6" },
              ].map(({ label, value, sub, color }) => (
                <div key={label} style={{ background: `${color}0a`, border: `1px solid ${color}20`, borderRadius: "12px", padding: "16px" }}>
                  <p style={{ fontSize: "11px", color: "#64748b", marginBottom: "8px", lineHeight: 1.4 }}>{label}</p>
                  <p style={{ fontSize: "20px", fontWeight: 900, color, fontFamily: "'Plus Jakarta Sans',sans-serif", marginBottom: "4px" }}>{value}</p>
                  <p style={{ fontSize: "11px", color: "#475569" }}>{sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        @keyframes spin  { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
