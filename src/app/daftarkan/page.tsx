"use client";
import { useState, useEffect, useRef } from "react";
import { Package, MapPin, User, CheckCircle, ChevronRight, Leaf, AlertCircle, Loader2, LogIn, Building2, Navigation, ChevronDown, Type, Locate, Sparkles } from "lucide-react";
import type { MaterialCategory } from "@/lib/mockData";
import { categoryLabels, categoryIcons, categoryColors } from "@/lib/mockData";
import { useAuth } from "@/lib/auth-context";
import AuthModal from "@/components/AuthModal";
import { provinsiList, getKotaByProvinsi } from "@/lib/indonesia-regions";
import dynamic from "next/dynamic";
import DropdownSelect from "@/components/DropdownSelect";
import MaterialAnalyzer from "@/components/MaterialAnalyzer";

const MapPicker = dynamic(() => import("@/components/MapPicker"), { ssr: false, loading: () => <div style={{ height: "320px", borderRadius: "12px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", color: "#475569", fontSize: "13px" }}><Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} />Memuat peta...</div> });

const CATEGORIES: MaterialCategory[] = ["baja", "semen", "kayu", "keramik", "kaca", "bata", "pipa", "lainnya"];

const STEPS = [
  { id: 1, label: "Identitas", icon: User },
  { id: 2, label: "Material",  icon: Package },
  { id: 3, label: "Lokasi",    icon: MapPin },
  { id: 4, label: "Konfirmasi", icon: CheckCircle },
];

const CO2_PER_TON: Record<MaterialCategory, number> = {
  baja: 2.5, semen: 1.5, kayu: 2.0, keramik: 0.8,
  kaca: 1.2, bata: 0.7, pipa: 1.8, lainnya: 1.0,
};

interface FormData {
  companyName: string; contactName: string; phone: string; email: string; companyType: string;
  category: MaterialCategory | ""; title: string; description: string; weight: string;
  condition: string; price: string; priceUnit: string;
  city: string; province: string; address: string;
  lat: string; lng: string;
}

const initialForm: FormData = {
  companyName: "", contactName: "", phone: "", email: "", companyType: "Kontraktor Besar",
  category: "", title: "", description: "", weight: "", condition: "Baik", price: "", priceUnit: "per ton",
  city: "", province: "", address: "", lat: "", lng: "",
};

export default function DaftarkanPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [step, setStep]           = useState(1);
  const [form, setForm]           = useState<FormData>(initialForm);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [newListingId, setNewListingId] = useState<string | null>(null);
  const [gpsMode, setGpsMode] = useState<"teks" | "auto" | "peta">("teks");
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const mapPickerKey = useRef(0);

  // Derived: kota list based on selected province
  const kotaListStep3 = getKotaByProvinsi(form.province);

  // Prefill form from user profile whenever profile loads or changes
  useEffect(() => {
    if (profile) {
      const tipeMap: Record<string, string> = {
        kontraktor_besar: "Kontraktor Besar",
        pengembang: "Pengembang",
        pabrik_manufaktur: "Pabrik / Manufaktur",
        bumn: "BUMN",
        lainnya: "Lainnya",
      };
      setForm((prev) => ({
        ...prev,
        companyName:  profile.nama_perusahaan || prev.companyName,
        contactName:  profile.nama_penanggung_jawab || prev.contactName,
        email:        profile.email || prev.email,
        companyType:  tipeMap[profile.tipe_perusahaan] || prev.companyType,
        province:     profile.provinsi || prev.province,
        city:         profile.kota || prev.city,
      }));
    }
  }, [profile]);

  // Reset kota when provinsi changes
  const handleProvinsiChange = (val: string) => {
    setForm((f) => ({ ...f, province: val, city: "" }));
  };

  // Auto-locate GPS handler
  const handleGetGPS = (panToMap = false) => {
    if (!navigator.geolocation) {
      setGpsError("Browser Anda tidak mendukung GPS.");
      return;
    }
    setGpsLoading(true);
    setGpsError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((f) => ({
          ...f,
          lat: pos.coords.latitude.toFixed(6),
          lng: pos.coords.longitude.toFixed(6),
          address: f.address || `${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`,
        }));
        setGpsLoading(false);
        if (panToMap) setGpsMode("peta");
      },
      (err) => {
        setGpsError(err.code === 1 ? "Izin lokasi ditolak. Aktifkan akses lokasi di browser." : "Gagal mendapatkan lokasi. Coba lagi.");
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const set = (key: keyof FormData, val: string) => setForm((f) => ({ ...f, [key]: val }));


  const carbonSaved = form.category && form.weight
    ? (parseFloat(form.weight) * CO2_PER_TON[form.category as MaterialCategory]).toFixed(1)
    : "0";

  const canNext = () => {
    if (step === 1) return form.companyName && form.contactName && form.phone && form.email;
    if (step === 2) return form.category && form.title && form.weight;
    if (step === 3) return form.city && form.address;
    return true;
  };

  // ── Submit to API ──────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title:       form.title,
          category:    form.category,
          weight:      parseFloat(form.weight),
          condition:   form.condition,
          price:       form.price === "" ? 0 : parseFloat(form.price),
          priceUnit:   form.priceUnit,
          description: form.description,
          sellerName:  form.companyName,
          sellerType:  form.companyType === "Pabrik / Manufaktur" ? "Pabrik" : form.companyType as "Kontraktor Besar" | "Pengembang" | "Pabrik",
          projectName: `${form.companyName} — ${form.contactName}`,
          city:        form.city,
          province:    form.province,
          address:     form.address,
          carbonSaved: parseFloat(carbonSaved),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? `HTTP ${res.status}`);
      }

      setNewListingId(data.listing?.id ?? null);
      setSubmitted(true);
    } catch (err) {
      console.error("[Daftarkan] submit error:", err);
      setSubmitError(err instanceof Error ? err.message : "Terjadi kesalahan. Coba lagi.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Auth Loading ───────────────────────────────────────────────────────────
  if (authLoading) {
    return (
      <div style={{ paddingTop: "68px", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Loader2 size={32} color="#10b981" style={{ animation: "spin 1s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // ── Auth Gate ──────────────────────────────────────────────────────────────
  if (!user) {
    return (
      <>
        <div style={{ paddingTop: "68px", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 24px", position: "relative", overflow: "hidden" }}>
          {/* Background orbs */}
          <div className="orb orb-emerald" style={{ width: "500px", height: "500px", top: "-200px", left: "-150px" }} />
          <div className="orb orb-indigo" style={{ width: "400px", height: "400px", bottom: "-150px", right: "-100px" }} />

          <div className="glass-card" style={{ maxWidth: "520px", width: "100%", padding: "48px", textAlign: "center", position: "relative", zIndex: 1, border: "1px solid rgba(16,185,129,0.15)" }}>
            {/* Icon */}
            <div style={{ width: "80px", height: "80px", borderRadius: "20px", background: "linear-gradient(135deg, rgba(16,185,129,0.15), rgba(99,102,241,0.15))", border: "1px solid rgba(16,185,129,0.25)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
              <Building2 size={36} color="#10b981" />
            </div>

            <div className="badge badge-emerald" style={{ marginBottom: "16px" }}>Khusus Member</div>

            <h1 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: "clamp(24px,4vw,32px)", fontWeight: 900, color: "#f1f5f9", letterSpacing: "-1px", marginBottom: "12px" }}>
              Masuk untuk Mendaftarkan <span className="gradient-text">Material Sisa</span>
            </h1>
            <p style={{ fontSize: "14px", color: "#64748b", lineHeight: 1.7, marginBottom: "32px" }}>
              Fitur ini hanya tersedia untuk perusahaan yang terdaftar di SisaProyek. Daftar gratis dan mulai selamatkan material sisa proyek Anda.
            </p>

            {/* Benefits */}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "32px", textAlign: "left" }}>
              {[
                "Data perusahaan Anda otomatis terisi — tanpa input ulang",
                "Kelola semua listing material dari satu dashboard",
                "Pantau dampak karbon & nilai ekonomi secara real-time",
              ].map((item) => (
                <div key={item} style={{ display: "flex", alignItems: "flex-start", gap: "10px", background: "rgba(16,185,129,0.05)", border: "1px solid rgba(16,185,129,0.1)", borderRadius: "10px", padding: "10px 14px" }}>
                  <CheckCircle size={15} color="#10b981" style={{ flexShrink: 0, marginTop: "1px" }} />
                  <span style={{ fontSize: "13px", color: "#94a3b8", lineHeight: 1.5 }}>{item}</span>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                id="gate-signup-btn"
                onClick={() => setAuthModalOpen(true)}
                className="btn-primary"
                style={{ flex: 1, justifyContent: "center", padding: "13px", fontSize: "14px" }}
              >
                <Building2 size={16} />
                Daftar Perusahaan — Gratis
              </button>
              <button
                id="gate-login-btn"
                onClick={() => setAuthModalOpen(true)}
                className="btn-secondary"
                style={{ display: "flex", alignItems: "center", gap: "6px", padding: "13px 20px", fontSize: "14px" }}
              >
                <LogIn size={16} />
                Masuk
              </button>
            </div>
          </div>
        </div>
        <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} defaultTab="signup" />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </>
    );
  }

  // ── Success Screen ─────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div style={{ paddingTop: "68px", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 24px" }}>
        <div className="glass-card" style={{ maxWidth: "520px", width: "100%", padding: "48px", textAlign: "center" }}>
          <div style={{ width: "72px", height: "72px", borderRadius: "50%", background: "rgba(16,185,129,0.15)", border: "2px solid rgba(16,185,129,0.4)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
            <CheckCircle size={32} color="#10b981" />
          </div>
          <h2 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: "28px", fontWeight: 900, color: "#f1f5f9", marginBottom: "12px" }}>
            Material Berhasil Didaftarkan!
          </h2>
          <p style={{ fontSize: "14px", color: "#64748b", lineHeight: 1.7, marginBottom: "8px" }}>
            Listing <strong style={{ color: "#f1f5f9" }}>{form.title}</strong> telah tersimpan di database dan kini tampil di marketplace.
          </p>
          {newListingId && (
            <p style={{ fontSize: "12px", color: "#334155", marginBottom: "20px" }}>
              ID Listing: <code style={{ color: "#10b981" }}>{newListingId}</code>
            </p>
          )}
          <div style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: "12px", padding: "16px", marginBottom: "24px" }}>
            <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "6px" }}>Dampak listing ini:</p>
            <p style={{ fontSize: "24px", fontWeight: 900, color: "#10b981", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
              🌿 {carbonSaved} Ton CO₂ Tersimpan
            </p>
            <p style={{ fontSize: "12px", color: "#475569", marginTop: "4px" }}>dari {form.weight} Ton {form.category}</p>
          </div>
          <div style={{ display: "flex", gap: "10px", flexDirection: "column" }}>
            <button
              className="btn-primary"
              style={{ width: "100%", justifyContent: "center" }}
              onClick={() => { setSubmitted(false); setForm(initialForm); setStep(1); setNewListingId(null); }}
            >
              + Daftarkan Material Lain
            </button>
            <a href="/marketplace" className="btn-secondary" style={{ width: "100%", justifyContent: "center" }}>
              Lihat di Marketplace
            </a>
          </div>
        </div>
      </div>
    );
  }

  // ── Multi-step Form ────────────────────────────────────────────────────────
  return (
    <div style={{ paddingTop: "68px", minHeight: "100vh", padding: "80px 24px 60px" }}>
      <div style={{ maxWidth: "720px", margin: "0 auto" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div className="badge badge-emerald" style={{ marginBottom: "12px" }}>Daftarkan Material Sisa</div>
          <h1 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 900, color: "#f1f5f9", letterSpacing: "-1px", marginBottom: "10px" }}>
            Ubah Sisa Proyek Jadi <span className="gradient-text">Nilai Ekonomi</span>
          </h1>
          <p style={{ fontSize: "15px", color: "#64748b", lineHeight: 1.6 }}>
            Daftarkan material konstruksi sisa Anda dan hubungkan dengan ribuan pembeli potensial di seluruh Indonesia.
          </p>
        </div>

        {/* Stepper */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0", marginBottom: "40px" }}>
          {STEPS.map(({ id, label, icon: Icon }, idx) => (
            <div key={id} style={{ display: "flex", alignItems: "center" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                <div style={{
                  width: "40px", height: "40px", borderRadius: "50%",
                  background: step > id ? "#10b981" : step === id ? "linear-gradient(135deg,#10b981,#059669)" : "rgba(255,255,255,0.05)",
                  border: `2px solid ${step >= id ? "#10b981" : "rgba(255,255,255,0.1)"}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all 0.3s ease",
                  boxShadow: step === id ? "0 0 20px rgba(16,185,129,0.4)" : "none",
                }}>
                  {step > id ? <CheckCircle size={18} color="white" /> : <Icon size={16} color={step >= id ? "white" : "#475569"} />}
                </div>
                <span style={{ fontSize: "11px", fontWeight: step >= id ? 700 : 400, color: step >= id ? "#10b981" : "#475569", whiteSpace: "nowrap" }}>
                  {label}
                </span>
              </div>
              {idx < STEPS.length - 1 && (
                <div style={{ width: "80px", height: "2px", background: step > id ? "#10b981" : "rgba(255,255,255,0.08)", margin: "0 4px 20px", transition: "background 0.3s ease" }} />
              )}
            </div>
          ))}
        </div>

        {/* Form Card */}
        <div className="glass-card" style={{ padding: "32px" }}>

          {/* Step 1: Identity */}
          {step === 1 && (
            <div>
              <h2 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: "20px", fontWeight: 800, color: "#f1f5f9", marginBottom: "16px" }}>
                Informasi Perusahaan
              </h2>

              {/* Prefill notice */}
              {profile && (
                <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "rgba(16,185,129,0.07)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: "10px", padding: "10px 14px", marginBottom: "20px" }}>
                  <CheckCircle size={15} color="#10b981" style={{ flexShrink: 0 }} />
                  <p style={{ fontSize: "12px", color: "#34d399", lineHeight: 1.5 }}>
                    Data perusahaan diisi otomatis dari profil akun Anda. Anda tetap bisa mengubahnya jika perlu.
                  </p>
                </div>
              )}

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={labelStyle}>Nama Perusahaan *</label>
                  <input
                    id="field-company" className="input-field"
                    placeholder="PT Wijaya Karya Beton"
                    value={form.companyName}
                    onChange={(e) => set("companyName", e.target.value)}
                    readOnly={!!profile?.nama_perusahaan}
                    style={{ opacity: profile?.nama_perusahaan ? 0.75 : 1, cursor: profile?.nama_perusahaan ? "default" : "text" }}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Tipe Perusahaan</label>
                  <select id="field-companytype" className="input-field" value={form.companyType} onChange={(e) => set("companyType", e.target.value)} style={{ cursor: "pointer" }}>
                    {["Kontraktor Besar", "Pengembang", "Pabrik / Manufaktur", "BUMN", "Lainnya"].map((t) => (
                      <option key={t} value={t} style={{ background: "#111827" }}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Nama Penanggung Jawab *</label>
                  <input
                    id="field-contact" className="input-field"
                    placeholder="Ir. Budi Santoso"
                    value={form.contactName}
                    onChange={(e) => set("contactName", e.target.value)}
                    readOnly={!!profile?.nama_penanggung_jawab}
                    style={{ opacity: profile?.nama_penanggung_jawab ? 0.75 : 1, cursor: profile?.nama_penanggung_jawab ? "default" : "text" }}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Nomor Telepon *</label>
                  <input id="field-phone" className="input-field" placeholder="+62 812 3456 7890" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
                </div>
                <div>
                  <label style={labelStyle}>Email *</label>
                  <input
                    id="field-email" className="input-field" type="email"
                    placeholder="budi@perusahaan.co.id"
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                    readOnly={!!profile?.email}
                    style={{ opacity: profile?.email ? 0.75 : 1, cursor: profile?.email ? "default" : "text" }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Material */}
          {step === 2 && (
            <div>
              <h2 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: "20px", fontWeight: 800, color: "#f1f5f9", marginBottom: "24px" }}>
                Detail Material
              </h2>

              <div style={{ marginBottom: "20px" }}>
                <label style={labelStyle}>Kategori Material *</label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px" }}>
                  {CATEGORIES.map((cat) => {
                    const active = form.category === cat;
                    const color = categoryColors[cat];
                    return (
                      <button
                        key={cat}
                        id={`cat-${cat}`}
                        onClick={() => set("category", cat)}
                        style={{
                          padding: "10px 8px", borderRadius: "10px",
                          border: `1px solid ${active ? color + "60" : "rgba(255,255,255,0.08)"}`,
                          background: active ? `${color}18` : "rgba(255,255,255,0.03)",
                          cursor: "pointer",
                          display: "flex", flexDirection: "column", alignItems: "center", gap: "4px",
                          transition: "all 0.2s ease",
                        }}
                      >
                        <span style={{ fontSize: "20px" }}>{categoryIcons[cat]}</span>
                        <span style={{ fontSize: "10px", fontWeight: 600, color: active ? color : "#64748b" }}>
                          {categoryLabels[cat].split(" ")[0]}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ── AI Quality Inspector ── */}
              {form.category && (
                <MaterialAnalyzer
                  category={form.category}
                  weight={form.weight}
                  onApply={({ condition, price, priceUnit, description }) => {
                    setForm((f) => ({
                      ...f,
                      condition,
                      price,
                      priceUnit,
                      description: f.description || description,
                    }));
                  }}
                />
              )}
              {!form.category && (
                <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "rgba(99,102,241,0.05)", border: "1px dashed rgba(99,102,241,0.2)", borderRadius: "12px", padding: "14px 16px", marginBottom: "4px" }}>
                  <Sparkles size={14} color="#818cf8" style={{ flexShrink: 0 }} />
                  <p style={{ fontSize: "12px", color: "#475569" }}>Pilih <strong style={{ color: "#818cf8" }}>kategori material</strong> di atas untuk mengaktifkan AI Quality Inspector — analisis foto & rekomendasi harga otomatis.</p>
                </div>
              )}

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={labelStyle}>Judul Listing *</label>
                  <input id="field-title" className="input-field" placeholder="cth: Baja H-Beam 150mm Sisa Proyek Gedung 30 Lantai" value={form.title} onChange={(e) => set("title", e.target.value)} />
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={labelStyle}>Deskripsi Material</label>
                  <textarea id="field-desc" className="input-field" rows={3} placeholder="Jelaskan spesifikasi, dimensi, kondisi, dan informasi relevan lainnya..." value={form.description} onChange={(e) => set("description", e.target.value)} style={{ resize: "vertical", minHeight: "80px" }} />
                </div>
                <div>
                  <label style={labelStyle}>Berat (Ton) *</label>
                  <input id="field-weight" className="input-field" type="number" min="0.1" step="0.1" placeholder="cth: 45" value={form.weight} onChange={(e) => set("weight", e.target.value)} />
                </div>
                <div>
                  <label style={labelStyle}>Kondisi</label>
                  <select id="field-condition" className="input-field" value={form.condition} onChange={(e) => set("condition", e.target.value)} style={{ cursor: "pointer" }}>
                    {["Sangat Baik", "Baik", "Cukup"].map((c) => (
                      <option key={c} value={c} style={{ background: "#111827" }}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Harga (0 = Gratis)</label>
                  <input id="field-price" className="input-field" type="number" min="0" placeholder="cth: 8500000" value={form.price} onChange={(e) => set("price", e.target.value)} />
                </div>
                <div>
                  <label style={labelStyle}>Satuan Harga</label>
                  <select id="field-priceunit" className="input-field" value={form.priceUnit} onChange={(e) => set("priceUnit", e.target.value)} style={{ cursor: "pointer" }}>
                    {["per ton", "per m²", "per unit", "gratis"].map((u) => (
                      <option key={u} value={u} style={{ background: "#111827" }}>{u}</option>
                    ))}
                  </select>
                </div>
              </div>

              {form.weight && form.category && (
                <div style={{ marginTop: "16px", background: "rgba(16,185,129,0.07)", border: "1px solid rgba(16,185,129,0.15)", borderRadius: "12px", padding: "14px 16px", display: "flex", alignItems: "center", gap: "10px" }}>
                  <Leaf size={18} color="#10b981" />
                  <div>
                    <p style={{ fontSize: "13px", fontWeight: 700, color: "#34d399" }}>
                      Estimasi CO₂ Tersimpan: {carbonSaved} Ton
                    </p>
                    <p style={{ fontSize: "11px", color: "#475569" }}>
                      Berdasarkan {form.weight} ton {form.category} yang tidak perlu diproduksi ulang
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Location */}
          {step === 3 && (
            <div>
              <h2 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: "20px", fontWeight: 800, color: "#f1f5f9", marginBottom: "24px" }}>
                Lokasi Material
              </h2>

              {/* ── Provinsi + Kota ── */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "24px" }}>
                {/* Provinsi (kiri) */}
                <div>
                  <label style={labelStyle}>Provinsi *</label>
                  <DropdownSelect
                    id="field-province"
                    value={form.province}
                    onChange={handleProvinsiChange}
                    options={provinsiList}
                    placeholder="Pilih provinsi"
                  />
                </div>

                {/* Kota (kanan) */}
                <div>
                  <label style={labelStyle}>Kota / Kabupaten *</label>
                  <DropdownSelect
                    id="field-city"
                    value={form.city}
                    onChange={(val) => set("city", val)}
                    options={kotaListStep3}
                    placeholder={!form.province ? "Pilih provinsi dulu" : "Pilih kota / kabupaten"}
                    disabled={!form.province}
                  />
                </div>
              </div>

              {/* ── Mode Picker: 3 tab ── */}
              <div style={{ marginBottom: "14px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
                  <label style={labelStyle}>Alamat / Titik Lokasi *</label>
                  {/* 3-tab toggle */}
                  <div style={{ display: "flex", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", padding: "3px", gap: "2px" }}>
                    {([
                      { key: "teks",  label: "Teks",        emoji: "✏️", Icon: Type },
                      { key: "auto",  label: "Auto Locate", emoji: null, Icon: Locate },
                      { key: "peta",  label: "Pilih di Peta", emoji: null, Icon: MapPin },
                    ] as const).map(({ key, label, Icon }) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => { setGpsMode(key); setGpsError(null); }}
                        style={{
                          display: "flex", alignItems: "center", gap: "5px",
                          padding: "6px 12px", borderRadius: "7px", border: "none", cursor: "pointer",
                          fontSize: "11px", fontWeight: 600, transition: "all 0.2s",
                          background: gpsMode === key
                            ? key === "teks" ? "rgba(16,185,129,0.2)"
                              : key === "auto" ? "rgba(99,102,241,0.2)"
                              : "rgba(6,182,212,0.2)"
                            : "transparent",
                          color: gpsMode === key
                            ? key === "teks" ? "#34d399"
                              : key === "auto" ? "#818cf8"
                              : "#22d3ee"
                            : "#475569",
                        }}
                      >
                        <Icon size={11} />{label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* ── Mode: Teks ── */}
                {gpsMode === "teks" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <textarea
                      id="field-address"
                      className="input-field"
                      rows={3}
                      placeholder="Jl. Industri No. 5, Kawasan Pergudangan, RT 02 RW 04, Bekasi..."
                      value={form.address}
                      onChange={(e) => set("address", e.target.value)}
                      style={{ resize: "vertical", minHeight: "80px" }}
                    />
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "rgba(6,182,212,0.05)", border: "1px solid rgba(6,182,212,0.12)", borderRadius: "10px", padding: "9px 12px" }}>
                      <AlertCircle size={13} color="#06b6d4" style={{ flexShrink: 0 }} />
                      <p style={{ fontSize: "11px", color: "#475569", lineHeight: 1.5 }}>
                        Koordinat peta dikalkulasi otomatis dari kota yang dipilih. Untuk presisi lebih gunakan <strong style={{ color: "#22d3ee" }}>Pilih di Peta</strong>.
                      </p>
                    </div>
                  </div>
                )}

                {/* ── Mode: Auto Locate ── */}
                {gpsMode === "auto" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <button
                      type="button"
                      onClick={() => handleGetGPS(false)}
                      disabled={gpsLoading}
                      style={{
                        display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                        padding: "13px",
                        background: gpsLoading ? "rgba(99,102,241,0.2)" : "linear-gradient(135deg,#6366f1,#4f46e5)",
                        color: "white", border: "none", borderRadius: "12px",
                        cursor: gpsLoading ? "not-allowed" : "pointer",
                        fontSize: "14px", fontWeight: 700, transition: "all 0.2s",
                        boxShadow: gpsLoading ? "none" : "0 4px 16px rgba(99,102,241,0.4)",
                      }}
                    >
                      {gpsLoading
                        ? <><Loader2 size={17} style={{ animation: "spin 1s linear infinite" }} /> Mendeteksi lokasi...</>
                        : <><Navigation size={17} /> Gunakan Lokasi Saya Sekarang</>
                      }
                    </button>

                    {gpsError && (
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "10px", padding: "10px 13px" }}>
                        <AlertCircle size={14} color="#f87171" />
                        <span style={{ fontSize: "12px", color: "#f87171" }}>{gpsError}</span>
                      </div>
                    )}

                    {form.lat && form.lng && !gpsLoading && (
                      <div style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.25)", borderRadius: "12px", padding: "14px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "10px" }}>
                          <CheckCircle size={15} color="#818cf8" />
                          <span style={{ fontSize: "12px", fontWeight: 700, color: "#818cf8" }}>Koordinat Berhasil Terdeteksi</span>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "12px" }}>
                          {[["LATITUDE", form.lat], ["LONGITUDE", form.lng]].map(([label, val]) => (
                            <div key={label} style={{ background: "rgba(255,255,255,0.04)", borderRadius: "8px", padding: "8px 12px" }}>
                              <p style={{ fontSize: "10px", color: "#475569", marginBottom: "2px", fontWeight: 600 }}>{label}</p>
                              <p style={{ fontSize: "14px", fontWeight: 700, color: "#f1f5f9", fontFamily: "monospace" }}>{val}</p>
                            </div>
                          ))}
                        </div>
                        <button
                          type="button"
                          onClick={() => setGpsMode("peta")}
                          style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", padding: "9px", background: "rgba(6,182,212,0.1)", border: "1px solid rgba(6,182,212,0.25)", borderRadius: "8px", color: "#22d3ee", cursor: "pointer", fontSize: "12px", fontWeight: 600 }}
                        >
                          <MapPin size={13} /> Lihat & Koreksi di Peta
                        </button>
                        <div style={{ marginTop: "12px" }}>
                          <label style={{ ...labelStyle, marginBottom: "5px" }}>Keterangan Alamat (opsional)</label>
                          <textarea
                            id="field-address-auto"
                            className="input-field"
                            rows={2}
                            placeholder="Nama gedung, lantai, dll..."
                            value={form.address}
                            onChange={(e) => set("address", e.target.value)}
                            style={{ resize: "vertical", minHeight: "60px" }}
                          />
                        </div>
                      </div>
                    )}

                    {!form.lat && !gpsLoading && (
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "10px", padding: "10px 13px" }}>
                        <AlertCircle size={13} color="#475569" style={{ flexShrink: 0 }} />
                        <span style={{ fontSize: "12px", color: "#475569" }}>Klik tombol di atas untuk mendeteksi lokasi Anda secara otomatis menggunakan GPS perangkat.</span>
                      </div>
                    )}
                  </div>
                )}

                {/* ── Mode: Pilih di Peta ── */}
                {gpsMode === "peta" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {/* Instruction banner */}
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "rgba(6,182,212,0.07)", border: "1px solid rgba(6,182,212,0.2)", borderRadius: "10px", padding: "10px 13px" }}>
                      <MapPin size={14} color="#22d3ee" style={{ flexShrink: 0 }} />
                      <p style={{ fontSize: "12px", color: "#94a3b8", lineHeight: 1.5 }}>
                        <strong style={{ color: "#22d3ee" }}>Klik di peta</strong> untuk meletakkan pin lokasi material. Pin juga bisa <strong style={{ color: "#22d3ee" }}>digeser</strong> setelah diletakkan.
                      </p>
                    </div>

                    {/* Auto-locate button on top of map */}
                    <button
                      type="button"
                      onClick={() => handleGetGPS(false)}
                      disabled={gpsLoading}
                      style={{
                        display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
                        padding: "9px 16px",
                        background: gpsLoading ? "rgba(99,102,241,0.15)" : "rgba(99,102,241,0.12)",
                        border: "1px solid rgba(99,102,241,0.3)",
                        color: "#818cf8", borderRadius: "9px", cursor: gpsLoading ? "not-allowed" : "pointer",
                        fontSize: "12px", fontWeight: 600, transition: "all 0.2s",
                        alignSelf: "flex-start",
                      }}
                    >
                      {gpsLoading
                        ? <><Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} /> Mendeteksi...</>
                        : <><Locate size={13} /> Auto-locate ke posisi saya</>
                      }
                    </button>

                    {/* The interactive map */}
                    <MapPicker
                      lat={form.lat ? parseFloat(form.lat) : 0}
                      lng={form.lng ? parseFloat(form.lng) : 0}
                      onChange={(lat, lng) => {
                        setForm((f) => ({
                          ...f,
                          lat: lat.toFixed(6),
                          lng: lng.toFixed(6),
                        }));
                      }}
                    />

                    {/* Coordinates display */}
                    {form.lat && form.lng && (
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", alignItems: "center" }}>
                        <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: "8px", padding: "8px 12px" }}>
                          <p style={{ fontSize: "10px", color: "#475569", marginBottom: "2px", fontWeight: 600 }}>LATITUDE</p>
                          <p style={{ fontSize: "13px", fontWeight: 700, color: "#f1f5f9", fontFamily: "monospace" }}>{form.lat}</p>
                        </div>
                        <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: "8px", padding: "8px 12px" }}>
                          <p style={{ fontSize: "10px", color: "#475569", marginBottom: "2px", fontWeight: 600 }}>LONGITUDE</p>
                          <p style={{ fontSize: "13px", fontWeight: 700, color: "#f1f5f9", fontFamily: "monospace" }}>{form.lng}</p>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "5px", background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: "8px", padding: "8px 10px" }}>
                          <CheckCircle size={13} color="#10b981" />
                          <span style={{ fontSize: "11px", color: "#34d399", fontWeight: 600 }}>Pin aktif</span>
                        </div>
                      </div>
                    )}

                    {!form.lat && (
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "rgba(245,158,11,0.07)", border: "1px solid rgba(245,158,11,0.15)", borderRadius: "10px", padding: "10px 13px" }}>
                        <AlertCircle size={13} color="#f59e0b" style={{ flexShrink: 0 }} />
                        <span style={{ fontSize: "12px", color: "#94a3b8" }}>Belum ada pin. Klik pada peta untuk menentukan lokasi material.</span>
                      </div>
                    )}

                    {/* Keterangan alamat */}
                    <div>
                      <label style={{ ...labelStyle, marginBottom: "5px" }}>Keterangan Alamat (opsional)</label>
                      <textarea
                        id="field-address-map"
                        className="input-field"
                        rows={2}
                        placeholder="Nama gedung, jalan, patokan lokasi..."
                        value={form.address}
                        onChange={(e) => set("address", e.target.value)}
                        style={{ resize: "vertical", minHeight: "60px" }}
                      />
                    </div>

                    {gpsError && (
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "10px", padding: "9px 12px" }}>
                        <AlertCircle size={13} color="#f87171" />
                        <span style={{ fontSize: "12px", color: "#f87171" }}>{gpsError}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 4: Confirm */}
          {step === 4 && (
            <div>
              <h2 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: "20px", fontWeight: 800, color: "#f1f5f9", marginBottom: "24px" }}>
                Konfirmasi & Terbitkan
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "24px" }}>
                {[
                  { label: "Perusahaan", value: `${form.companyName} (${form.companyType})` },
                  { label: "Kontak",     value: `${form.contactName} • ${form.phone}` },
                  { label: "Material",   value: `${form.title} — ${form.weight} Ton` },
                  { label: "Kategori",   value: form.category ? `${categoryIcons[form.category as MaterialCategory]} ${categoryLabels[form.category as MaterialCategory]}` : "-" },
                  { label: "Kondisi",    value: form.condition },
                  { label: "Harga",      value: form.price === "" || form.price === "0" ? "GRATIS" : `Rp ${parseInt(form.price).toLocaleString("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${form.priceUnit}` },
                  { label: "Lokasi",     value: `${form.city}, ${form.province}` },
                  { label: "Dampak CO₂", value: `${carbonSaved} Ton CO₂ Tersimpan` },
                ].map(({ label, value }) => (
                  <div key={label} style={{ display: "flex", gap: "12px", padding: "10px 14px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "10px" }}>
                    <span style={{ fontSize: "12px", color: "#475569", fontWeight: 600, minWidth: "100px" }}>{label}</span>
                    <span style={{ fontSize: "13px", color: "#f1f5f9" }}>{value}</span>
                  </div>
                ))}
              </div>

              {/* Error banner */}
              {submitError && (
                <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "10px", padding: "12px 16px", marginBottom: "16px", display: "flex", gap: "10px", alignItems: "center" }}>
                  <AlertCircle size={15} color="#ef4444" />
                  <p style={{ fontSize: "13px", color: "#fca5a5" }}>{submitError}</p>
                </div>
              )}

              <div style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: "12px", padding: "14px", marginBottom: "8px" }}>
                <p style={{ fontSize: "12px", color: "#64748b" }}>
                  Dengan menekan "Terbitkan Listing", data akan langsung tersimpan ke database dan tampil di marketplace.
                </p>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "28px", gap: "12px" }}>
            {step > 1 ? (
              <button id="form-back-btn" className="btn-secondary" onClick={() => setStep(s => s - 1)} disabled={submitting}>
                ← Kembali
              </button>
            ) : <div />}

            {step < 4 ? (
              <button
                id="form-next-btn"
                className="btn-primary"
                onClick={() => setStep(s => s + 1)}
                disabled={!canNext()}
                style={{ opacity: canNext() ? 1 : 0.4, cursor: canNext() ? "pointer" : "not-allowed" }}
              >
                Lanjut <ChevronRight size={15} />
              </button>
            ) : (
              <button
                id="form-submit-btn"
                className="btn-primary"
                onClick={handleSubmit}
                disabled={submitting}
                style={{
                  background: "linear-gradient(135deg,#10b981,#059669)",
                  gap: "8px",
                  opacity: submitting ? 0.7 : 1,
                  cursor: submitting ? "not-allowed" : "pointer",
                }}
              >
                {submitting ? (
                  <>
                    <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
                    Menyimpan ke Database...
                  </>
                ) : (
                  <>
                    <CheckCircle size={16} />
                    Terbitkan Listing
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "12px",
  fontWeight: 700,
  color: "#475569",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
  marginBottom: "6px",
};
