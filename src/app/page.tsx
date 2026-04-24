"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  MapPin,
  BarChart3,
  ArrowRight,
  Building2,
  Leaf,
  TrendingDown,
  Users,
  Zap,
  Shield,
  Globe,
  ChevronRight,
  Star,
  Package,
  Truck,
} from "lucide-react";

// ─── Animated Counter ────────────────────────────────────────────────────────
function AnimatedCounter({
  end,
  duration = 2000,
  prefix = "",
  suffix = "",
  decimals = 0,
}: {
  end: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const startTime = performance.now();
          const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(parseFloat((eased * end).toFixed(decimals)));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end, duration, decimals]);

  return (
    <span ref={ref}>
      {prefix}
      {decimals > 0 ? count.toFixed(decimals) : Math.floor(count).toLocaleString("id-ID")}
      {suffix}
    </span>
  );
}

// ─── Feature Card ─────────────────────────────────────────────────────────────
function FeatureCard({
  icon: Icon,
  color,
  title,
  description,
  delay,
}: {
  icon: React.ElementType;
  color: string;
  title: string;
  description: string;
  delay: number;
}) {
  return (
    <div
      className="glass-card-hover"
      style={{
        padding: "28px",
        animationDelay: `${delay}ms`,
      }}
    >
      <div
        style={{
          width: "48px",
          height: "48px",
          borderRadius: "12px",
          background: `${color}22`,
          border: `1px solid ${color}33`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "16px",
        }}
      >
        <Icon size={22} color={color} />
      </div>
      <h3
        style={{
          fontSize: "17px",
          fontWeight: 700,
          color: "#f1f5f9",
          marginBottom: "10px",
          fontFamily: "'Plus Jakarta Sans', sans-serif",
        }}
      >
        {title}
      </h3>
      <p style={{ fontSize: "14px", color: "#64748b", lineHeight: 1.7 }}>
        {description}
      </p>
    </div>
  );
}

// ─── Testimonial Card ─────────────────────────────────────────────────────────
function TestimonialCard({
  quote,
  name,
  role,
  company,
  rating,
}: {
  quote: string;
  name: string;
  role: string;
  company: string;
  rating: number;
}) {
  return (
    <div className="glass-card" style={{ padding: "24px" }}>
      <div style={{ display: "flex", gap: "2px", marginBottom: "12px" }}>
        {Array.from({ length: rating }).map((_, i) => (
          <Star key={i} size={14} fill="#f59e0b" color="#f59e0b" />
        ))}
      </div>
      <p
        style={{
          fontSize: "14px",
          color: "#94a3b8",
          lineHeight: 1.7,
          marginBottom: "16px",
          fontStyle: "italic",
        }}
      >
        "{quote}"
      </p>
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <div
          style={{
            width: "38px",
            height: "38px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #10b981, #6366f1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "14px",
            fontWeight: 700,
            color: "white",
          }}
        >
          {name[0]}
        </div>
        <div>
          <p style={{ fontSize: "13px", fontWeight: 600, color: "#f1f5f9" }}>
            {name}
          </p>
          <p style={{ fontSize: "11px", color: "#64748b" }}>
            {role} — {company}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function HomePage() {
  return (
    <div style={{ paddingTop: "68px" }}>
      {/* ── Hero Section ── */}
      <section
        className="grid-bg noise-overlay"
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
          padding: "80px 24px",
        }}
      >
        {/* Orbs */}
        <div
          className="orb orb-emerald"
          style={{ width: "600px", height: "600px", top: "-200px", left: "-200px" }}
        />
        <div
          className="orb orb-indigo"
          style={{ width: "400px", height: "400px", bottom: "-100px", right: "-100px" }}
        />
        <div
          className="orb orb-amber"
          style={{ width: "300px", height: "300px", top: "30%", right: "10%" }}
        />

        <div
          style={{
            maxWidth: "900px",
            margin: "0 auto",
            textAlign: "center",
            position: "relative",
            zIndex: 1,
          }}
        >
          {/* Top Badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: "rgba(16,185,129,0.1)",
              border: "1px solid rgba(16,185,129,0.25)",
              borderRadius: "100px",
              padding: "6px 16px",
              marginBottom: "32px",
            }}
          >
            <Zap size={13} color="#10b981" />
            <span style={{ fontSize: "12px", color: "#34d399", fontWeight: 600 }}>
              Platform Circular Economy #1 untuk Konstruksi Indonesia
            </span>
          </div>

          {/* Headline */}
          <h1
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: "clamp(40px, 7vw, 76px)",
              fontWeight: 900,
              lineHeight: 1.05,
              letterSpacing: "-2px",
              marginBottom: "24px",
              color: "#f1f5f9",
            }}
          >
            Sisa Material Konstruksi
            <br />
            <span className="gradient-text">Bernilai Miliaran.</span>
            <br />
            Jangan Buang ke TPA.
          </h1>

          {/* Subheadline */}
          <p
            style={{
              fontSize: "clamp(16px, 2.5vw, 20px)",
              color: "#64748b",
              lineHeight: 1.7,
              maxWidth: "680px",
              margin: "0 auto 40px",
            }}
          >
            SisaProyek menghubungkan kontraktor besar yang ingin membuang sisa
            material dengan UMKM, arsitek, dan kampus teknik yang membutuhkan
            material murah — dilengkapi peta geo-spatial real-time dan analitik
            dampak karbon untuk laporan CSR.
          </p>

          {/* CTA Buttons */}
          <div
            style={{
              display: "flex",
              gap: "12px",
              justifyContent: "center",
              flexWrap: "wrap",
              marginBottom: "60px",
            }}
          >
            <Link href="/marketplace" className="btn-primary" style={{ fontSize: "15px", padding: "14px 28px" }}>
              <MapPin size={17} />
              Lihat Marketplace
              <ArrowRight size={15} />
            </Link>
            <Link href="/daftarkan" className="btn-secondary" style={{ fontSize: "15px", padding: "14px 28px" }}>
              <Package size={17} />
              Daftarkan Material Sisa
            </Link>
          </div>

          {/* Trust Badges */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "24px",
              flexWrap: "wrap",
            }}
          >
            {[
              { icon: Shield, label: "Terverifikasi" },
              { icon: Globe, label: "28 Kota Aktif" },
              { icon: Truck, label: "Logistik Terintegrasi" },
            ].map(({ icon: Icon, label }) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  color: "#475569",
                  fontSize: "13px",
                }}
              >
                <Icon size={14} color="#10b981" />
                {label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Impact Stats ── */}
      <section
        style={{
          padding: "80px 24px",
          background: "linear-gradient(180deg, #080e1a 0%, #0a1220 100%)",
        }}
      >
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "24px",
            }}
          >
            {[
              {
                value: 847,
                suffix: " Ton",
                label: "Material Diselamatkan",
                color: "#10b981",
                icon: Leaf,
              },
              {
                value: 339,
                suffix: " Ton",
                label: "CO₂ Dikurangi",
                color: "#06b6d4",
                icon: Globe,
              },
              {
                value: 312,
                suffix: "",
                label: "Transaksi Selesai",
                color: "#6366f1",
                icon: TrendingDown,
              },
              {
                value: 89,
                suffix: "+",
                label: "UMKM Terbantu",
                color: "#f59e0b",
                icon: Users,
              },
            ].map(({ value, suffix, label, color, icon: Icon }) => (
              <div
                key={label}
                className="stat-card"
                style={{ textAlign: "center" }}
              >
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "12px",
                    background: `${color}18`,
                    border: `1px solid ${color}30`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 12px",
                  }}
                >
                  <Icon size={22} color={color} />
                </div>
                <div
                  style={{
                    fontSize: "36px",
                    fontWeight: 900,
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    color,
                    letterSpacing: "-1px",
                    marginBottom: "4px",
                  }}
                >
                  <AnimatedCounter end={value} suffix={suffix} />
                </div>
                <p style={{ fontSize: "13px", color: "#64748b", fontWeight: 500 }}>
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section style={{ padding: "100px 24px" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "60px" }}>
            <div className="badge badge-emerald" style={{ marginBottom: "16px" }}>
              Fitur Unggulan
            </div>
            <h2
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: "clamp(28px, 4vw, 44px)",
                fontWeight: 800,
                color: "#f1f5f9",
                letterSpacing: "-1px",
                marginBottom: "16px",
              }}
            >
              Lebih dari Sekedar
              <span className="gradient-text"> Marketplace</span>
            </h2>
            <p style={{ color: "#64748b", fontSize: "16px", maxWidth: "600px", margin: "0 auto" }}>
              Ekosistem lengkap yang menggabungkan teknologi geo-spatial, analitik ESG,
              dan jejaring industri konstruksi Indonesia.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "20px",
            }}
          >
            <FeatureCard
              icon={MapPin}
              color="#10b981"
              title="Peta Geo-Spatial Real-Time"
              description="Visualisasikan semua listing material sisa di seluruh Indonesia. Filter berdasarkan jenis material, jarak, dan kapasitas truk. Hitung rute logistik optimal secara instan."
              delay={0}
            />
            <FeatureCard
              icon={BarChart3}
              color="#6366f1"
              title="Dashboard Analitik CSR"
              description="Pantau dampak lingkungan secara real-time: ton material diselamatkan, reduksi emisi CO₂, dan penghematan biaya. Siap diekspor untuk laporan ESG dan CSR perusahaan."
              delay={100}
            />
            <FeatureCard
              icon={Building2}
              color="#f59e0b"
              title="Verifikasi Kontraktor B2B"
              description="Sistem verifikasi berlapis untuk kontraktor besar dan UMKM. Profil bisnis lengkap, rating transaksi, dan riwayat proyek terpercaya untuk setiap pengguna platform."
              delay={200}
            />
            <FeatureCard
              icon={Truck}
              color="#06b6d4"
              title="Koordinasi Logistik Truk"
              description="Estimasi biaya angkut otomatis berdasarkan jarak dan berat material. Integrasikan armada truk Anda atau gunakan mitra logistik terverifikasi kami."
              delay={300}
            />
            <FeatureCard
              icon={Leaf}
              color="#34d399"
              title="Kalkulator Dampak Karbon"
              description="Hitung pengurangan emisi CO₂ setiap transaksi secara otomatis. Setiap listing menampilkan proyeksi karbon tersimpan untuk mendorong keputusan pembelian."
              delay={400}
            />
            <FeatureCard
              icon={Shield}
              color="#8b5cf6"
              title="Transaksi Aman & Terjamin"
              description="Escrow payment terintegrasi untuk keamanan transaksi B2B skala besar. Sistem dispute resolution dan jaminan kualitas material oleh tim verifikator kami."
              delay={500}
            />
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section
        style={{
          padding: "100px 24px",
          background: "linear-gradient(180deg, transparent, rgba(16,185,129,0.03), transparent)",
        }}
      >
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "60px" }}>
            <div className="badge badge-cyan" style={{ marginBottom: "16px" }}>
              Cara Kerja
            </div>
            <h2
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: "clamp(28px, 4vw, 44px)",
                fontWeight: 800,
                color: "#f1f5f9",
                letterSpacing: "-1px",
              }}
            >
              Semudah 3 Langkah
            </h2>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "32px",
              position: "relative",
            }}
          >
            {[
              {
                step: "01",
                title: "Daftarkan Material",
                desc: "Kontraktor besar mendaftarkan sisa material dengan detail spesifikasi, foto, dan lokasi. AI kami otomatis menghitung estimasi nilai dan dampak karbonnya.",
                color: "#10b981",
              },
              {
                step: "02",
                title: "Temukan di Peta",
                desc: "Buyer mencari material via peta interaktif. Filter jarak, kategori, dan harga. Sistem menghitung rute truk terdekat secara otomatis.",
                color: "#6366f1",
              },
              {
                step: "03",
                title: "Transaksi & Impact",
                desc: "Negosiasi, pembayaran, dan pengiriman terpantau platform. Dashboard langsung memperbarui metrik dampak lingkungan dan penghematan biaya.",
                color: "#f59e0b",
              },
            ].map(({ step, title, desc, color }) => (
              <div
                key={step}
                className="glass-card"
                style={{ padding: "32px", position: "relative", overflow: "hidden" }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: "-10px",
                    right: "-10px",
                    fontSize: "80px",
                    fontWeight: 900,
                    color: `${color}08`,
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    lineHeight: 1,
                  }}
                >
                  {step}
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    fontWeight: 700,
                    color,
                    marginBottom: "12px",
                    letterSpacing: "2px",
                    textTransform: "uppercase",
                  }}
                >
                  Langkah {step}
                </div>
                <h3
                  style={{
                    fontSize: "20px",
                    fontWeight: 700,
                    color: "#f1f5f9",
                    marginBottom: "12px",
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                  }}
                >
                  {title}
                </h3>
                <p style={{ fontSize: "14px", color: "#64748b", lineHeight: 1.7 }}>
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section style={{ padding: "80px 24px" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <div className="badge badge-amber" style={{ marginBottom: "16px" }}>
              Testimoni
            </div>
            <h2
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: "clamp(24px, 3vw, 36px)",
                fontWeight: 800,
                color: "#f1f5f9",
                letterSpacing: "-1px",
              }}
            >
              Dipercaya Industri Konstruksi Indonesia
            </h2>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "20px",
            }}
          >
            <TestimonialCard
              quote="Kami punya 45 ton baja sisa proyek gedung. Dalam 2 minggu sudah laku semua via SisaProyek. Hemat biaya disposal hampir Rp 500 juta dan dapat pemasukan tambahan."
              name="Ir. Hendra Wijaya"
              role="Project Director"
              company="PT Wijaya Karya"
              rating={5}
            />
            <TestimonialCard
              quote="Sebagai kontraktor kecil, kami biasa beli material seharga full. Sekarang bisa dapat baja dan keramik kualitas bagus dengan harga 40% lebih murah. Margin proyek kami meningkat signifikan."
              name="Bambang Santoso"
              role="Owner"
              company="CV Maju Jaya Konstruksi"
              rating={5}
            />
            <TestimonialCard
              quote="Data impact karbon di dashboard SisaProyek langsung kami masukkan ke laporan CSR tahunan. Tim ESG kami sangat terbantu. Ini solusi yang benar-benar B2B ready."
              name="Nadia Rahmawati, MBA"
              role="Head of ESG & Sustainability"
              company="PT Agung Sedayu Group"
              rating={5}
            />
          </div>
        </div>
      </section>

      {/* ── CTA Section ── */}
      <section style={{ padding: "100px 24px" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <div
            className="glass-card"
            style={{
              padding: "60px 48px",
              textAlign: "center",
              background:
                "linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(99,102,241,0.08) 100%)",
              border: "1px solid rgba(16,185,129,0.2)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              className="orb orb-emerald"
              style={{ width: "400px", height: "400px", top: "-200px", left: "-100px" }}
            />
            <div
              className="orb orb-indigo"
              style={{ width: "300px", height: "300px", bottom: "-150px", right: "-100px" }}
            />
            <div style={{ position: "relative", zIndex: 1 }}>
              <div className="badge badge-emerald" style={{ marginBottom: "20px" }}>
                🚀 Bergabung Sekarang — Gratis
              </div>
              <h2
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: "clamp(28px, 4vw, 44px)",
                  fontWeight: 900,
                  color: "#f1f5f9",
                  letterSpacing: "-1px",
                  marginBottom: "16px",
                }}
              >
                Mulai Selamatkan Material
                <br />
                <span className="gradient-text">Sisa Proyek Anda</span>
              </h2>
              <p
                style={{
                  color: "#64748b",
                  fontSize: "16px",
                  marginBottom: "36px",
                  lineHeight: 1.7,
                }}
              >
                Bergabung dengan 312+ kontraktor dan UMKM yang sudah merasakan manfaat
                ekonomi dan lingkungan dari SisaProyek.
              </p>
              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  justifyContent: "center",
                  flexWrap: "wrap",
                }}
              >
                <Link
                  href="/daftarkan"
                  className="btn-primary"
                  style={{ fontSize: "15px", padding: "14px 32px" }}
                >
                  <Package size={17} />
                  Daftarkan Material Gratis
                  <ArrowRight size={15} />
                </Link>
                <Link
                  href="/marketplace"
                  className="btn-secondary"
                  style={{ fontSize: "15px", padding: "14px 32px" }}
                >
                  <MapPin size={17} />
                  Jelajahi Marketplace
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer
        style={{
          borderTop: "1px solid rgba(255,255,255,0.06)",
          padding: "40px 24px",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <p style={{ fontSize: "13px", color: "#334155" }}>
            © 2026 SisaProyek. Circular Economy untuk Konstruksi Indonesia.
            Mengurangi 30% limbah konstruksi, satu transaksi pada satu waktu.
          </p>
          <p style={{ fontSize: "11px", color: "#1e293b", marginTop: "8px" }}>
            Industri konstruksi menyumbang 30% limbah global. Bersama, kita ubah itu.
          </p>
        </div>
      </footer>
    </div>
  );
}
