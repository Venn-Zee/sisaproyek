"use client";
import { useState } from "react";
import { Package, MapPin, User, CheckCircle, ChevronRight, Leaf, AlertCircle, Loader2 } from "lucide-react";
import type { MaterialCategory } from "@/lib/mockData";
import { categoryLabels, categoryIcons, categoryColors } from "@/lib/mockData";

const CATEGORIES: MaterialCategory[] = ["baja", "semen", "kayu", "keramik", "kaca", "bata", "pipa", "lainnya"];

const CITIES = [
  "Jakarta Pusat", "Jakarta Selatan", "Jakarta Utara", "Jakarta Barat", "Jakarta Timur",
  "Bekasi", "Depok", "Bogor", "Tangerang", "Cikarang",
  "Bandung", "Semarang", "Surabaya", "Yogyakarta", "Cilegon",
  "Medan", "Makassar", "Palembang", "Majalengka", "Lainnya",
];

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
}

const initialForm: FormData = {
  companyName: "", contactName: "", phone: "", email: "", companyType: "Kontraktor Besar",
  category: "", title: "", description: "", weight: "", condition: "Baik", price: "", priceUnit: "per ton",
  city: "", province: "", address: "",
};

export default function DaftarkanPage() {
  const [step, setStep]           = useState(1);
  const [form, setForm]           = useState<FormData>(initialForm);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [newListingId, setNewListingId] = useState<string | null>(null);

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
              <h2 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: "20px", fontWeight: 800, color: "#f1f5f9", marginBottom: "24px" }}>
                Informasi Perusahaan
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={labelStyle}>Nama Perusahaan *</label>
                  <input id="field-company" className="input-field" placeholder="PT Wijaya Karya Beton" value={form.companyName} onChange={(e) => set("companyName", e.target.value)} />
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
                  <input id="field-contact" className="input-field" placeholder="Ir. Budi Santoso" value={form.contactName} onChange={(e) => set("contactName", e.target.value)} />
                </div>
                <div>
                  <label style={labelStyle}>Nomor Telepon *</label>
                  <input id="field-phone" className="input-field" placeholder="+62 812 3456 7890" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
                </div>
                <div>
                  <label style={labelStyle}>Email *</label>
                  <input id="field-email" className="input-field" type="email" placeholder="budi@perusahaan.co.id" value={form.email} onChange={(e) => set("email", e.target.value)} />
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
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={labelStyle}>Kota *</label>
                  <select id="field-city" className="input-field" value={form.city} onChange={(e) => set("city", e.target.value)} style={{ cursor: "pointer" }}>
                    <option value="" style={{ background: "#111827" }}>Pilih Kota</option>
                    {CITIES.map((c) => (
                      <option key={c} value={c} style={{ background: "#111827" }}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Provinsi</label>
                  <input id="field-province" className="input-field" placeholder="cth: Jawa Barat" value={form.province} onChange={(e) => set("province", e.target.value)} />
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={labelStyle}>Alamat Lengkap *</label>
                  <textarea id="field-address" className="input-field" rows={3} placeholder="Jl. Industri No. 5, Kawasan Pergudangan..." value={form.address} onChange={(e) => set("address", e.target.value)} style={{ resize: "vertical", minHeight: "80px" }} />
                </div>
              </div>
              <div style={{ marginTop: "16px", background: "rgba(6,182,212,0.07)", border: "1px solid rgba(6,182,212,0.15)", borderRadius: "12px", padding: "12px 16px", display: "flex", gap: "10px" }}>
                <AlertCircle size={16} color="#06b6d4" style={{ flexShrink: 0, marginTop: "2px" }} />
                <p style={{ fontSize: "12px", color: "#64748b", lineHeight: 1.6 }}>
                  Koordinat GPS akan dikalkukasi otomatis berdasarkan kota yang Anda pilih dan ditampilkan pada peta marketplace.
                </p>
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
                  { label: "Harga",      value: form.price === "" || form.price === "0" ? "GRATIS" : `Rp ${parseInt(form.price).toLocaleString("id-ID")} ${form.priceUnit}` },
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
