"use client";
import { useState, useEffect, useRef } from "react";
import {
  X, Mail, Lock, Eye, EyeOff, User, Building2, MapPin,
  ChevronDown, Loader2, CheckCircle2, AlertCircle, ShoppingBag, HardHat,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";
import { provinsiList, getKotaByProvinsi } from "@/lib/indonesia-regions";

const TIPE_PERUSAHAAN = [
  { value: "kontraktor_besar", label: "Kontraktor Besar" },
  { value: "pengembang", label: "Pengembang" },
  { value: "pabrik_manufaktur", label: "Pabrik / Manufaktur" },
  { value: "bumn", label: "BUMN" },
  { value: "lainnya", label: "Lainnya" },
];

type UserType = "buyer" | "seller";
type Tab = "login" | "signup";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: Tab;
}

export default function AuthModal({ isOpen, onClose, defaultTab = "login" }: AuthModalProps) {
  const { refreshProfile } = useAuth();
  const [tab, setTab] = useState<Tab>(defaultTab);
  const [userType, setUserType] = useState<UserType>("buyer");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const overlayRef = useRef<HTMLDivElement>(null);

  // Login
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Signup shared
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [namaPJ, setNamaPJ] = useState("");

  // Seller-only
  const [namaPerusahaan, setNamaPerusahaan] = useState("");
  const [tipePerusahaan, setTipePerusahaan] = useState("");
  const [provinsi, setProvinsi] = useState("");
  const [kota, setKota] = useState("");
  const kotaList = getKotaByProvinsi(provinsi);

  useEffect(() => { setTab(defaultTab); setError(""); setSuccess(""); }, [defaultTab, isOpen]);
  useEffect(() => { setKota(""); }, [provinsi]);
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen) return null;

  const resetForms = () => {
    setLoginEmail(""); setLoginPassword("");
    setEmail(""); setPassword(""); setConfirmPassword("");
    setNamaPJ(""); setNamaPerusahaan(""); setTipePerusahaan("");
    setProvinsi(""); setKota(""); setError(""); setSuccess("");
  };
  const handleClose = () => { resetForms(); onClose(); };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setSuccess(""); setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: loginEmail, password: loginPassword });
      if (error) throw error;
      await refreshProfile();
      setSuccess("Berhasil masuk! Selamat datang kembali.");
      setTimeout(() => handleClose(), 1200);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal masuk.";
      setError(msg === "Invalid login credentials" ? "Email atau password salah." : msg);
    } finally { setLoading(false); }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setSuccess("");
    if (password !== confirmPassword) { setError("Password tidak cocok."); return; }
    if (password.length < 6) { setError("Password minimal 6 karakter."); return; }
    if (userType === "seller") {
      if (!tipePerusahaan) { setError("Pilih tipe perusahaan."); return; }
      if (!provinsi) { setError("Pilih provinsi."); return; }
      if (!kota) { setError("Pilih kota/kabupaten."); return; }
    }
    setLoading(true);
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({ email, password });
      if (signUpError) throw signUpError;
      if (!data.user) throw new Error("Gagal membuat akun.");
      const { error: profileError } = await supabase.from("user_profiles").insert({
        id: data.user.id,
        email,
        nama_penanggung_jawab: namaPJ,
        nama_perusahaan: userType === "seller" ? namaPerusahaan : "",
        tipe_perusahaan: userType === "buyer" ? "pembeli" : tipePerusahaan,
        provinsi: userType === "seller" ? provinsi : "",
        kota: userType === "seller" ? kota : "",
      });
      if (profileError) throw profileError;
      await refreshProfile();
      setSuccess("Akun berhasil dibuat! Selamat bergabung di SisaProyek.");
      setTimeout(() => handleClose(), 1500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal mendaftar.";
      setError(msg.includes("already registered") ? "Email sudah terdaftar. Silakan login." : msg);
    } finally { setLoading(false); }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px",
    padding: "11px 14px 11px 40px", color: "#f1f5f9", fontSize: "14px",
    outline: "none", transition: "all 0.2s ease", fontFamily: "'Inter', sans-serif",
  };
  const selectStyle: React.CSSProperties = {
    ...inputStyle, padding: "11px 36px 11px 40px",
    appearance: "none", WebkitAppearance: "none", cursor: "pointer",
    background: "rgba(255,255,255,0.05)", color: "#94a3b8",
  };
  const labelStyle: React.CSSProperties = {
    display: "block", fontSize: "12px", fontWeight: 600, color: "#64748b",
    marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.5px",
  };
  const onFocus = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    e.target.style.borderColor = "rgba(16,185,129,0.5)";
    e.target.style.boxShadow = "0 0 0 3px rgba(16,185,129,0.1)";
  };
  const onBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    e.target.style.borderColor = "rgba(255,255,255,0.1)";
    e.target.style.boxShadow = "none";
  };

  return (
    <div
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) handleClose(); }}
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "16px", animation: "fadeIn 0.2s ease",
      }}
    >
      <div
        style={{
          width: "100%", maxWidth: "500px",
          background: "linear-gradient(145deg, #0f1d2e, #111827)",
          border: "1px solid rgba(255,255,255,0.1)", borderRadius: "20px",
          boxShadow: "0 40px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(16,185,129,0.1)",
          overflow: "hidden", maxHeight: "92vh", overflowY: "auto",
          animation: "slideUp 0.3s ease",
        }}
      >
        {/* Header */}
        <div style={{ padding: "24px 24px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
              <div style={{ width: "28px", height: "28px", borderRadius: "8px", background: "linear-gradient(135deg,#10b981,#059669)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Building2 size={14} color="white" />
              </div>
              <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: "16px", color: "#f1f5f9" }}>SisaProyek</span>
            </div>
            <p style={{ fontSize: "13px", color: "#475569" }}>Platform Circular Economy Konstruksi</p>
          </div>
          <button onClick={handleClose} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "6px", color: "#64748b", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <X size={16} />
          </button>
        </div>

        {/* Tabs */}
        <div style={{ padding: "20px 24px 0" }}>
          <div style={{ display: "flex", background: "rgba(255,255,255,0.04)", borderRadius: "12px", padding: "4px", border: "1px solid rgba(255,255,255,0.06)" }}>
            {(["login", "signup"] as Tab[]).map((t) => (
              <button key={t} onClick={() => { setTab(t); setError(""); setSuccess(""); }}
                style={{ flex: 1, padding: "9px", borderRadius: "9px", border: "none", cursor: "pointer", fontSize: "13px", fontWeight: 600, transition: "all 0.2s", background: tab === t ? "linear-gradient(135deg,#10b981,#059669)" : "transparent", color: tab === t ? "white" : "#475569", boxShadow: tab === t ? "0 4px 12px rgba(16,185,129,0.3)" : "none" }}>
                {t === "login" ? "Masuk" : "Daftar Akun"}
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: "20px 24px 24px" }}>
          {/* Alerts */}
          {error && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "10px", padding: "10px 12px", marginBottom: "16px" }}>
              <AlertCircle size={15} color="#f87171" />
              <span style={{ fontSize: "13px", color: "#f87171" }}>{error}</span>
            </div>
          )}
          {success && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: "10px", padding: "10px 12px", marginBottom: "16px" }}>
              <CheckCircle2 size={15} color="#34d399" />
              <span style={{ fontSize: "13px", color: "#34d399" }}>{success}</span>
            </div>
          )}

          {/* ── LOGIN ── */}
          {tab === "login" && (
            <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={labelStyle}>Email</label>
                <div style={{ position: "relative" }}>
                  <Mail size={15} color="#475569" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                  <input id="login-email" type="email" required placeholder="email@perusahaan.com" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Password</label>
                <div style={{ position: "relative" }}>
                  <Lock size={15} color="#475569" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                  <input id="login-password" type={showPassword ? "text" : "password"} required placeholder="••••••••" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} style={{ ...inputStyle, paddingRight: "40px" }} onFocus={onFocus} onBlur={onBlur} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#475569", display: "flex" }}>
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
              <button id="btn-login" type="submit" disabled={loading} style={{ width: "100%", padding: "13px", background: loading ? "rgba(16,185,129,0.4)" : "linear-gradient(135deg,#10b981,#059669)", color: "white", border: "none", borderRadius: "12px", fontSize: "14px", fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", boxShadow: "0 4px 16px rgba(16,185,129,0.3)" }}>
                {loading && <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />}
                {loading ? "Memproses..." : "Masuk ke Akun"}
              </button>
              <p style={{ textAlign: "center", fontSize: "13px", color: "#475569" }}>
                Belum punya akun?{" "}
                <button type="button" onClick={() => setTab("signup")} style={{ background: "none", border: "none", color: "#10b981", cursor: "pointer", fontWeight: 600, fontSize: "13px" }}>Daftar sekarang</button>
              </p>
            </form>
          )}

          {/* ── SIGNUP ── */}
          {tab === "signup" && (
            <form onSubmit={handleSignup} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>

              {/* User Type Selector */}
              <div>
                <p style={{ fontSize: "12px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "8px" }}>Saya Mendaftar Sebagai</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                  {([
                    { type: "buyer" as UserType, icon: ShoppingBag, label: "Pembeli", sub: "Cari & beli material sisa" },
                    { type: "seller" as UserType, icon: HardHat, label: "Kontraktor / Penjual", sub: "Daftarkan material sisa" },
                  ]).map(({ type, icon: Icon, label, sub }) => (
                    <button
                      key={type} type="button" onClick={() => setUserType(type)}
                      style={{
                        padding: "12px", borderRadius: "12px", border: `1.5px solid ${userType === type ? "rgba(16,185,129,0.6)" : "rgba(255,255,255,0.08)"}`,
                        background: userType === type ? "rgba(16,185,129,0.1)" : "rgba(255,255,255,0.03)",
                        cursor: "pointer", textAlign: "left", transition: "all 0.2s",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                        <Icon size={16} color={userType === type ? "#10b981" : "#475569"} />
                        <span style={{ fontSize: "13px", fontWeight: 700, color: userType === type ? "#34d399" : "#94a3b8" }}>{label}</span>
                      </div>
                      <p style={{ fontSize: "11px", color: "#475569", lineHeight: 1.4 }}>{sub}</p>
                    </button>
                  ))}
                </div>
              </div>

              <hr style={{ border: "none", borderTop: "1px solid rgba(255,255,255,0.06)" }} />

              {/* Shared fields */}
              <div>
                <label style={labelStyle}>Email</label>
                <div style={{ position: "relative" }}>
                  <Mail size={15} color="#475569" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                  <input id="signup-email" type="email" required placeholder="email@anda.com" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Nama Lengkap</label>
                <div style={{ position: "relative" }}>
                  <User size={15} color="#475569" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                  <input id="signup-nama-pj" type="text" required placeholder={userType === "buyer" ? "Nama lengkap Anda" : "Nama penanggung jawab"} value={namaPJ} onChange={(e) => setNamaPJ(e.target.value)} style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={labelStyle}>Password</label>
                  <div style={{ position: "relative" }}>
                    <Lock size={15} color="#475569" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                    <input id="signup-password" type={showPassword ? "text" : "password"} required placeholder="Min. 6 karakter" value={password} onChange={(e) => setPassword(e.target.value)} style={{ ...inputStyle, paddingRight: "36px" }} onFocus={onFocus} onBlur={onBlur} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#475569", display: "flex" }}>
                      {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Konfirmasi</label>
                  <div style={{ position: "relative" }}>
                    <Lock size={15} color="#475569" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                    <input id="signup-confirm-password" type={showConfirmPassword ? "text" : "password"} required placeholder="Ulangi password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} style={{ ...inputStyle, paddingRight: "36px", borderColor: confirmPassword && password !== confirmPassword ? "rgba(239,68,68,0.5)" : "rgba(255,255,255,0.1)" }} onFocus={onFocus} onBlur={(e) => { e.target.style.borderColor = confirmPassword && password !== confirmPassword ? "rgba(239,68,68,0.5)" : "rgba(255,255,255,0.1)"; e.target.style.boxShadow = "none"; }} />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#475569", display: "flex" }}>
                      {showConfirmPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Seller-only fields */}
              {userType === "seller" && (
                <>
                  <hr style={{ border: "none", borderTop: "1px solid rgba(255,255,255,0.06)" }} />
                  <p style={{ fontSize: "11px", fontWeight: 700, color: "#10b981", textTransform: "uppercase", letterSpacing: "1px" }}>Data Perusahaan</p>

                  <div>
                    <label style={labelStyle}>Nama Perusahaan</label>
                    <div style={{ position: "relative" }}>
                      <Building2 size={15} color="#475569" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                      <input id="signup-nama-perusahaan" type="text" required placeholder="PT / CV / Koperasi..." value={namaPerusahaan} onChange={(e) => setNamaPerusahaan(e.target.value)} style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
                    </div>
                  </div>

                  <div>
                    <label style={labelStyle}>Tipe Perusahaan</label>
                    <div style={{ position: "relative" }}>
                      <Building2 size={15} color="#475569" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                      <select id="signup-tipe-perusahaan" required value={tipePerusahaan} onChange={(e) => setTipePerusahaan(e.target.value)} style={selectStyle} onFocus={onFocus} onBlur={onBlur}>
                        <option value="" disabled style={{ background: "#111827" }}>Pilih tipe perusahaan</option>
                        {TIPE_PERUSAHAAN.map((t) => <option key={t.value} value={t.value} style={{ background: "#111827", color: "#f1f5f9" }}>{t.label}</option>)}
                      </select>
                      <ChevronDown size={14} color="#475569" style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <div>
                      <label style={labelStyle}>Provinsi</label>
                      <div style={{ position: "relative" }}>
                        <MapPin size={15} color="#475569" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                        <select id="signup-provinsi" required value={provinsi} onChange={(e) => setProvinsi(e.target.value)} style={selectStyle} onFocus={onFocus} onBlur={onBlur}>
                          <option value="" disabled style={{ background: "#111827" }}>Pilih provinsi</option>
                          {provinsiList.map((p) => <option key={p} value={p} style={{ background: "#111827", color: "#f1f5f9" }}>{p}</option>)}
                        </select>
                        <ChevronDown size={14} color="#475569" style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                      </div>
                    </div>
                    <div>
                      <label style={labelStyle}>Kota</label>
                      <div style={{ position: "relative" }}>
                        <MapPin size={15} color="#475569" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                        <select id="signup-kota" required value={kota} onChange={(e) => setKota(e.target.value)} disabled={!provinsi} style={{ ...selectStyle, opacity: !provinsi ? 0.5 : 1, cursor: !provinsi ? "not-allowed" : "pointer" }} onFocus={onFocus} onBlur={onBlur}>
                          <option value="" disabled style={{ background: "#111827" }}>{!provinsi ? "Pilih provinsi dulu" : "Pilih kota"}</option>
                          {kotaList.map((k) => <option key={k} value={k} style={{ background: "#111827", color: "#f1f5f9" }}>{k}</option>)}
                        </select>
                        <ChevronDown size={14} color="#475569" style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                      </div>
                    </div>
                  </div>
                </>
              )}

              <button id="btn-signup" type="submit" disabled={loading} style={{ width: "100%", padding: "13px", background: loading ? "rgba(16,185,129,0.4)" : "linear-gradient(135deg,#10b981,#059669)", color: "white", border: "none", borderRadius: "12px", fontSize: "14px", fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", boxShadow: "0 4px 16px rgba(16,185,129,0.3)", marginTop: "4px" }}>
                {loading && <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />}
                {loading ? "Mendaftarkan Akun..." : userType === "buyer" ? "Daftar sebagai Pembeli" : "Daftar sebagai Kontraktor"}
              </button>

              <p style={{ textAlign: "center", fontSize: "13px", color: "#475569" }}>
                Sudah punya akun?{" "}
                <button type="button" onClick={() => setTab("login")} style={{ background: "none", border: "none", color: "#10b981", cursor: "pointer", fontWeight: 600, fontSize: "13px" }}>Masuk di sini</button>
              </p>
            </form>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(24px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        #login-email::placeholder, #login-password::placeholder,
        #signup-email::placeholder, #signup-password::placeholder,
        #signup-confirm-password::placeholder, #signup-nama-pj::placeholder,
        #signup-nama-perusahaan::placeholder { color: #475569; opacity: 1; }
      `}</style>
    </div>
  );
}
