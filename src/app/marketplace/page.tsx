"use client";
import { useState, useMemo, useCallback, lazy, Suspense, useEffect } from "react";
import type { MaterialCategory, MaterialListing, MaterialCondition } from "@/lib/mockData";
import { categoryColors, categoryLabels, categoryIcons } from "@/lib/mockData";
import MaterialCard from "@/components/MaterialCard";
import FilterPanel from "@/components/FilterPanel";
import { useAuth } from "@/lib/auth-context";
import {
  X, MapPin, Phone,
  MessageCircle, CheckCircle,
  Building2, Loader2, LogIn, Lock, Edit2, Save
} from "lucide-react";

const MarketplaceMap = lazy(() => import("@/components/MarketplaceMap"));

// ─── Loading Skeleton ─────────────────────────────────────────────────────────
function CardSkeleton() {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: "14px",
        padding: "16px",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        animation: "pulse 1.5s ease-in-out infinite",
      }}
    >
      <div style={{ height: "14px", width: "60%", background: "rgba(255,255,255,0.06)", borderRadius: "6px" }} />
      <div style={{ height: "12px", width: "85%", background: "rgba(255,255,255,0.04)", borderRadius: "6px" }} />
      <div style={{ height: "12px", width: "40%", background: "rgba(255,255,255,0.04)", borderRadius: "6px" }} />
      <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
        <div style={{ height: "28px", flex: 1, background: "rgba(255,255,255,0.05)", borderRadius: "8px" }} />
        <div style={{ height: "28px", flex: 1, background: "rgba(255,255,255,0.05)", borderRadius: "8px" }} />
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function MarketplacePage() {
  const { user } = useAuth();
  const [listings, setListings]         = useState<MaterialListing[]>([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState<string | null>(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const [search, setSearch]             = useState("");
  const [selectedCategories, setSelectedCategories] = useState<MaterialCategory[]>([]);
  const [selectedCity, setSelectedCity] = useState("Semua Kota");
  const [centerCity, setCenterCity]     = useState<[number, number]>([-6.2088, 106.8456]);
  const [maxPrice, setMaxPrice]         = useState(20000000);
  const [selectedId, setSelectedId]     = useState<string | null>(null);
  const [showDetail, setShowDetail]     = useState(false);

  // ── Fetch all listings from API on mount ───────────────────────────────────
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    fetch("/api/listings", { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(({ listings: data }) => {
        setListings(data as MaterialListing[]);
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          console.error("[Marketplace] fetch error:", err);
          setError("Gagal memuat data. Periksa koneksi Anda.");
        }
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, []);

  // ── Client-side filtering ─────────────────────────────────────────────────
  const filteredListings = useMemo(() => {
    return listings.filter((l) => {
      const matchSearch =
        !search ||
        l.title.toLowerCase().includes(search.toLowerCase()) ||
        l.location.city.toLowerCase().includes(search.toLowerCase()) ||
        l.seller.name.toLowerCase().includes(search.toLowerCase()) ||
        l.category.includes(search.toLowerCase());

      const matchCat =
        selectedCategories.length === 0 || selectedCategories.includes(l.category);

      const matchCity =
        selectedCity === "Semua Kota" ||
        l.location.city === selectedCity ||
        l.location.province.includes(selectedCity);

      const matchPrice =
        maxPrice === 20000000 || l.price === 0 || l.price <= maxPrice;

      return matchSearch && matchCat && matchCity && matchPrice;
    });
  }, [listings, search, selectedCategories, selectedCity, maxPrice]);

  const selectedListing = useMemo(
    () => listings.find((l) => l.id === selectedId) ?? null,
    [listings, selectedId]
  );

  const toggleCategory = useCallback((cat: MaterialCategory) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  }, []);

  const handleSelect = useCallback((id: string) => {
    setSelectedId(id);
    setShowDetail(true);
  }, []);

  return (
    <div style={{ paddingTop: "68px", height: "100vh", display: "flex", flexDirection: "column" }}>
      {/* ── Top bar ── */}
      <div
        style={{
          background: "rgba(8,14,26,0.95)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          padding: "12px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <MapPin size={16} color="#10b981" />
          <span style={{ fontSize: "14px", fontWeight: 700, color: "#f1f5f9" }}>
            Marketplace Peta
          </span>
          {loading ? (
            <span style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "12px", color: "#475569" }}>
              <Loader2 size={11} style={{ animation: "spin 1s linear infinite" }} />
              Memuat...
            </span>
          ) : (
            <span style={{ fontSize: "12px", color: "#475569" }}>
              {filteredListings.length} listing ditemukan
            </span>
          )}
        </div>

        {/* Auth status */}
        {user ? (
          <div style={{ display: "flex", alignItems: "center", gap: "6px", background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: "10px", padding: "6px 12px" }}>
            <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#10b981" }} />
            <span style={{ fontSize: "12px", color: "#34d399", fontWeight: 600 }}>Anda sudah login</span>
          </div>
        ) : (
          <button
            onClick={() => document.getElementById("btn-login-nav")?.click()}
            style={{ display: "flex", alignItems: "center", gap: "6px", padding: "6px 14px", background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: "10px", color: "#34d399", cursor: "pointer", fontSize: "12px", fontWeight: 600 }}
          >
            <LogIn size={13} /> Login untuk hubungi penjual
          </button>
        )}
      </div>

      {/* ── Main Layout ── */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* Left Panel */}
        <div
          style={{
            width: "380px",
            minWidth: "320px",
            display: "flex",
            flexDirection: "column",
            borderRight: "1px solid rgba(255,255,255,0.06)",
            background: "rgba(8,14,26,0.98)",
            overflow: "hidden",
          }}
        >
          {/* Filters */}
          <div style={{ padding: "16px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <FilterPanel
              search={search}
              onSearch={setSearch}
              selectedCategories={selectedCategories}
              onToggleCategory={toggleCategory}
              selectedCity={selectedCity}
              onCityChange={(city, coords) => {
                setSelectedCity(city);
                setCenterCity(coords);
              }}
              maxPrice={maxPrice}
              onMaxPrice={setMaxPrice}
              totalShown={filteredListings.length}
              totalAll={listings.length}
            />
          </div>

          {/* Listing Cards */}
          <div
            style={{ flex: 1, overflowY: "auto", padding: "12px", display: "flex", flexDirection: "column", gap: "10px" }}
          >
            {/* Error state */}
            {error && (
              <div
                style={{
                  textAlign: "center",
                  padding: "32px 16px",
                  color: "#ef4444",
                  background: "rgba(239,68,68,0.08)",
                  border: "1px solid rgba(239,68,68,0.2)",
                  borderRadius: "12px",
                }}
              >
                <div style={{ fontSize: "28px", marginBottom: "10px" }}>⚠️</div>
                <p style={{ fontSize: "13px", fontWeight: 600, marginBottom: "6px" }}>{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  style={{
                    marginTop: "8px",
                    padding: "6px 16px",
                    background: "rgba(239,68,68,0.2)",
                    border: "1px solid rgba(239,68,68,0.3)",
                    borderRadius: "8px",
                    color: "#fca5a5",
                    fontSize: "12px",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  Coba Lagi
                </button>
              </div>
            )}

            {/* Loading skeleton */}
            {loading && !error && [1, 2, 3, 4].map((i) => <CardSkeleton key={i} />)}

            {/* Empty state */}
            {!loading && !error && filteredListings.length === 0 && (
              <div style={{ textAlign: "center", padding: "40px 16px", color: "#475569" }}>
                <div style={{ fontSize: "32px", marginBottom: "12px" }}>🔍</div>
                <p style={{ fontSize: "14px", fontWeight: 600, marginBottom: "6px" }}>
                  Tidak ada material ditemukan
                </p>
                <p style={{ fontSize: "12px" }}>Coba ubah filter pencarian</p>
              </div>
            )}

            {/* Listing cards */}
            {!loading && !error && filteredListings.map((listing) => (
              <MaterialCard
                key={listing.id}
                listing={listing}
                isSelected={selectedId === listing.id}
                onClick={() => handleSelect(listing.id)}
              />
            ))}
          </div>
        </div>

        {/* Map */}
        <div style={{ flex: 1, position: "relative" }}>
          <Suspense
            fallback={
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  background: "#0d1628",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div style={{ textAlign: "center", color: "#475569" }}>
                  <div style={{ fontSize: "32px", marginBottom: "12px" }}>🗺️</div>
                  <p>Memuat peta...</p>
                </div>
              </div>
            }
          >
            <MarketplaceMap
              listings={filteredListings}
              selectedId={selectedId}
              onSelect={handleSelect}
              centerCity={centerCity}
            />
          </Suspense>

          {/* Legend overlay */}
          <div
            style={{
              position: "absolute",
              bottom: "20px",
              left: "20px",
              background: "rgba(8,14,26,0.9)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "12px",
              padding: "12px 16px",
              zIndex: 900,
            }}
          >
            <p style={{ fontSize: "10px", fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px" }}>
              Legenda
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", maxWidth: "240px" }}>
              {(["baja", "kayu", "keramik", "semen", "kaca", "bata", "pipa", "lainnya"] as MaterialCategory[]).map((cat) => (
                <div key={cat} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: categoryColors[cat] }} />
                  <span style={{ fontSize: "10px", color: "#64748b" }}>{categoryIcons[cat]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Detail Drawer ── */}
      {showDetail && selectedListing && (
        <DetailDrawer
          listing={selectedListing}
          isLoggedIn={!!user}
          onClose={() => { setShowDetail(false); setSelectedId(null); }}
          onRequestLogin={() => setShowLoginPrompt(true)}
          onUpdate={(updatedListing) => {
            setListings(listings.map(l => l.id === updatedListing.id ? updatedListing : l));
          }}
        />
      )}

      {/* ── Login Prompt Modal ── */}
      {showLoginPrompt && (
        <div
          onClick={() => setShowLoginPrompt(false)}
          style={{ position: "fixed", inset: 0, zIndex: 9998, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ background: "linear-gradient(145deg,#0f1d2e,#111827)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: "20px", padding: "36px 32px", maxWidth: "380px", width: "100%", textAlign: "center", boxShadow: "0 40px 80px rgba(0,0,0,0.6)" }}
          >
            <div style={{ width: "56px", height: "56px", borderRadius: "16px", background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <Lock size={24} color="#10b981" />
            </div>
            <h3 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: "20px", fontWeight: 800, color: "#f1f5f9", marginBottom: "8px" }}>Login Diperlukan</h3>
            <p style={{ fontSize: "14px", color: "#64748b", lineHeight: 1.6, marginBottom: "24px" }}>Untuk menghubungi penjual, kamu perlu login terlebih dahulu ke akun SisaProyek kamu.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <button
                id="login-prompt-btn"
                onClick={() => { setShowLoginPrompt(false); document.getElementById("btn-login-nav")?.click(); }}
                style={{ width: "100%", padding: "13px", background: "linear-gradient(135deg,#10b981,#059669)", color: "white", border: "none", borderRadius: "12px", fontSize: "14px", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", boxShadow: "0 4px 16px rgba(16,185,129,0.3)" }}
              >
                <LogIn size={16} /> Masuk ke Akun
              </button>
              <button
                onClick={() => { setShowLoginPrompt(false); document.getElementById("btn-signup-nav")?.click(); }}
                style={{ width: "100%", padding: "13px", background: "transparent", color: "#94a3b8", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}
              >
                Daftar Gratis
              </button>
              <button onClick={() => setShowLoginPrompt(false)} style={{ background: "none", border: "none", color: "#475569", cursor: "pointer", fontSize: "13px", marginTop: "4px" }}>Tutup</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin  { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
      `}</style>
    </div>
  );
}

// ─── Detail Drawer ─────────────────────────────────────────────────────────────
function DetailDrawer({ listing, isLoggedIn, onClose, onRequestLogin, onUpdate }: { listing: MaterialListing; isLoggedIn: boolean; onClose: () => void; onRequestLogin: () => void; onUpdate: (l: MaterialListing) => void }) {
  const { profile } = useAuth();
  const color = categoryColors[listing.category];

  const isOwner = profile?.nama_perusahaan === listing.seller.name && profile?.nama_perusahaan !== undefined;
  
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    price: listing.price,
    priceUnit: listing.priceUnit,
    condition: listing.condition,
    description: listing.description,
  });

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/listings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: listing.id,
          sellerName: profile?.nama_perusahaan,
          ...editForm,
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal menyimpan');
      
      onUpdate(data.listing);
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : 'Terjadi kesalahan saat menyimpan');
    } finally {
      setIsSaving(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px",
    padding: "10px 12px", color: "#f1f5f9", fontSize: "13px",
    outline: "none", marginBottom: "12px", fontFamily: "'Inter', sans-serif"
  };

  return (
    <div
      style={{
        position: "fixed",
        top: "68px",
        right: 0,
        bottom: 0,
        width: "400px",
        background: "rgba(8,14,26,0.98)",
        backdropFilter: "blur(20px)",
        borderLeft: "1px solid rgba(255,255,255,0.08)",
        zIndex: 950,
        overflowY: "auto",
        boxShadow: "-20px 0 60px rgba(0,0,0,0.5)",
      }}
    >
      {/* Close */}
      <button
        onClick={onClose}
        style={{
          position: "sticky",
          top: "16px",
          left: "calc(100% - 48px)",
          width: "32px",
          height: "32px",
          borderRadius: "50%",
          background: "rgba(255,255,255,0.08)",
          border: "1px solid rgba(255,255,255,0.1)",
          color: "#94a3b8",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          marginBottom: "-48px",
          zIndex: 10,
          marginLeft: "auto",
          marginRight: "16px",
        }}
        id="detail-close-btn"
        aria-label="Close detail"
      >
        <X size={15} />
      </button>

      <div style={{ padding: "24px" }}>
        {/* Category */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            background: `${color}18`,
            border: `1px solid ${color}30`,
            borderRadius: "100px",
            padding: "4px 12px",
            marginBottom: "12px",
            marginTop: "16px",
          }}
        >
          <span>{categoryIcons[listing.category]}</span>
          <span style={{ fontSize: "11px", fontWeight: 700, color, textTransform: "uppercase", letterSpacing: "0.5px" }}>
            {categoryLabels[listing.category]}
          </span>
        </div>

        {/* Title */}
        <h2 style={{ fontSize: "18px", fontWeight: 800, color: "#f1f5f9", lineHeight: 1.3, marginBottom: "16px", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
          {listing.title}
        </h2>

        {/* Key Metrics */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "20px" }}>
          {[
            { label: "Berat", value: `${listing.weight} Ton`, icon: "⚖️" },
            { label: "Kondisi", value: listing.condition, icon: "✅" },
            {
              label: "Harga",
              value: listing.price === 0 ? "GRATIS" : `Rp ${listing.price.toLocaleString("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
              icon: "💰",
              highlight: true,
            },
            { label: "CO₂ Saved", value: `${listing.carbonSaved} Ton`, icon: "🌿" },
          ].map(({ label, value, icon, highlight }) => (
            <div
              key={label}
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: "10px",
                padding: "12px",
              }}
            >
              <p style={{ fontSize: "10px", color: "#475569", fontWeight: 600, marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                {icon} {label}
              </p>
              <p style={{ fontSize: "14px", fontWeight: 800, color: highlight ? (listing.price === 0 ? "#34d399" : "#fbbf24") : "#f1f5f9" }}>
                {value}
              </p>
              {label === "Harga" && listing.price > 0 && (
                <p style={{ fontSize: "11px", color: "#94a3b8", marginTop: "2px" }}>/ {listing.priceUnit}</p>
              )}
            </div>
          ))}
        </div>

        {/* Status & Condition */}
        {isEditing ? (
          <div style={{ marginBottom: "20px", display: "flex", gap: "12px" }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", fontSize: "11px", color: "#475569", marginBottom: "6px", fontWeight: 600 }}>KONDISI</label>
              <select value={editForm.condition} onChange={e => setEditForm({...editForm, condition: e.target.value as MaterialCondition})} style={inputStyle}>
                {["Sangat Baik", "Baik", "Cukup"].map(c => <option key={c} value={c} style={{ background: "#111827" }}>{c}</option>)}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", fontSize: "11px", color: "#475569", marginBottom: "6px", fontWeight: 600 }}>HARGA</label>
              <input type="number" value={editForm.price} onChange={e => setEditForm({...editForm, price: Number(e.target.value)})} style={inputStyle} />
            </div>
          </div>
        ) : (
          <div style={{ marginBottom: "20px" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                background: listing.status === "Tersedia" ? "rgba(16,185,129,0.12)" : "rgba(245,158,11,0.12)",
                border: `1px solid ${listing.status === "Tersedia" ? "rgba(16,185,129,0.25)" : "rgba(245,158,11,0.25)"}`,
                borderRadius: "100px",
                padding: "6px 14px",
              }}
            >
              <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: listing.status === "Tersedia" ? "#10b981" : "#f59e0b" }} />
              <span style={{ fontSize: "12px", fontWeight: 700, color: listing.status === "Tersedia" ? "#34d399" : "#fbbf24" }}>
                {listing.status}
              </span>
            </div>
          </div>
        )}

        {/* Description */}
        <div style={{ marginBottom: "20px" }}>
          <h4 style={{ fontSize: "12px", fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "8px" }}>
            Deskripsi
          </h4>
          {isEditing ? (
            <textarea
              value={editForm.description}
              onChange={e => setEditForm({...editForm, description: e.target.value})}
              style={{ ...inputStyle, minHeight: "100px", resize: "vertical" }}
            />
          ) : (
            <p style={{ fontSize: "13px", color: "#94a3b8", lineHeight: 1.7 }}>
              {listing.description}
            </p>
          )}
        </div>

        {/* Location */}
        <div
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: "12px",
            padding: "14px",
            marginBottom: "20px",
          }}
        >
          <h4 style={{ fontSize: "12px", fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "10px" }}>
            📍 Lokasi
          </h4>
          <p style={{ fontSize: "13px", color: "#94a3b8", marginBottom: "4px" }}>{listing.location.address}</p>
          <p style={{ fontSize: "12px", color: "#64748b" }}>{listing.location.city}, {listing.location.province}</p>
          <p style={{ fontSize: "10px", color: "#475569", marginTop: "6px" }}>
            🌐 {listing.location.lat.toFixed(4)}, {listing.location.lng.toFixed(4)}
          </p>
        </div>

        {/* Seller */}
        <div
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: "12px",
            padding: "14px",
            marginBottom: "20px",
          }}
        >
          <h4 style={{ fontSize: "12px", fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "12px" }}>
            Penjual
          </h4>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
            <div
              style={{
                width: "40px", height: "40px", borderRadius: "10px",
                background: `linear-gradient(135deg, ${color}, #6366f1)`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "16px", fontWeight: 800, color: "white",
              }}
            >
              {listing.seller.name[0]}
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <p style={{ fontSize: "14px", fontWeight: 700, color: "#f1f5f9" }}>{listing.seller.name}</p>
                {listing.seller.verified && <CheckCircle size={13} color="#10b981" />}
              </div>
              <p style={{ fontSize: "11px", color: "#64748b" }}>
                {listing.seller.type} • ⭐ {listing.seller.rating}
              </p>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#475569" }}>
            <Building2 size={12} />
            {listing.seller.projectName}
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
          <div style={{ flex: 1, textAlign: "center", background: "rgba(255,255,255,0.03)", borderRadius: "10px", padding: "10px" }}>
            <p style={{ fontSize: "18px", fontWeight: 800, color: "#f1f5f9" }}>{listing.views.toLocaleString()}</p>
            <p style={{ fontSize: "10px", color: "#475569" }}>Views</p>
          </div>
          <div style={{ flex: 1, textAlign: "center", background: "rgba(255,255,255,0.03)", borderRadius: "10px", padding: "10px" }}>
            <p style={{ fontSize: "18px", fontWeight: 800, color: "#f1f5f9" }}>{listing.inquiries}</p>
            <p style={{ fontSize: "10px", color: "#475569" }}>Minat</p>
          </div>
          <div style={{ flex: 1, textAlign: "center", background: "rgba(255,255,255,0.03)", borderRadius: "10px", padding: "10px" }}>
            <p style={{ fontSize: "18px", fontWeight: 800, color: "#10b981" }}>{listing.carbonSaved}T</p>
            <p style={{ fontSize: "10px", color: "#475569" }}>CO₂</p>
          </div>
        </div>

        {/* CTA Buttons */}
        {isOwner ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {isEditing ? (
              <div style={{ display: "flex", gap: "10px" }}>
                <button onClick={() => setIsEditing(false)} style={{ flex: 1, padding: "14px", background: "transparent", color: "#94a3b8", fontWeight: 600, fontSize: "14px", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", cursor: "pointer" }}>
                  Batal
                </button>
                <button onClick={handleSave} disabled={isSaving} style={{ flex: 1, padding: "14px", background: "linear-gradient(135deg, #10b981, #059669)", color: "white", fontWeight: 700, fontSize: "14px", border: "none", borderRadius: "12px", cursor: isSaving ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", opacity: isSaving ? 0.7 : 1 }}>
                  {isSaving ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> : <Save size={16} />} Simpan
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                style={{ width: "100%", padding: "14px", background: "rgba(16,185,129,0.1)", color: "#34d399", fontWeight: 700, fontSize: "14px", border: "1px solid rgba(16,185,129,0.3)", borderRadius: "12px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
              >
                <Edit2 size={16} /> Edit Material
              </button>
            )}
          </div>
        ) : isLoggedIn ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <button
              id="detail-contact-btn"
              style={{ width: "100%", padding: "14px", background: "linear-gradient(135deg, #10b981, #059669)", color: "white", fontWeight: 700, fontSize: "14px", border: "none", borderRadius: "12px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
            >
              <Phone size={16} /> Hubungi Penjual
            </button>
            <button
              id="detail-inquiry-btn"
              style={{ width: "100%", padding: "14px", background: "transparent", color: "#94a3b8", fontWeight: 600, fontSize: "14px", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
            >
              <MessageCircle size={16} /> Kirim Penawaran
            </button>
          </div>
        ) : (
          <div
            style={{ border: "1px solid rgba(16,185,129,0.2)", borderRadius: "14px", padding: "20px", textAlign: "center", background: "rgba(16,185,129,0.04)" }}
          >
            <Lock size={22} color="#10b981" style={{ margin: "0 auto 10px" }} />
            <p style={{ fontSize: "13px", fontWeight: 700, color: "#f1f5f9", marginBottom: "6px" }}>Login untuk menghubungi penjual</p>
            <p style={{ fontSize: "12px", color: "#64748b", marginBottom: "14px", lineHeight: 1.5 }}>Buat akun gratis atau masuk untuk mengakses kontak penjual dan kirim penawaran.</p>
            <button
              id="detail-login-cta"
              onClick={onRequestLogin}
              style={{ width: "100%", padding: "12px", background: "linear-gradient(135deg,#10b981,#059669)", color: "white", border: "none", borderRadius: "10px", fontSize: "13px", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
            >
              <LogIn size={15} /> Masuk / Daftar Gratis
            </button>
          </div>
        )}

        {/* Posted date */}
        <p style={{ fontSize: "11px", color: "#475569", textAlign: "center", marginTop: "16px" }}>
          📅 Diposting {listing.postedAt} • Berlaku hingga {listing.expiresAt}
        </p>
        <p style={{ fontSize: "11px", color: "#334155", textAlign: "center" }}>
          ID: {listing.id}
        </p>
      </div>
    </div>
  );
}
