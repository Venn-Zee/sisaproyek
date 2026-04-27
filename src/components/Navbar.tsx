"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { Recycle, MapPin, BarChart3, Plus, Menu, X, Zap, LogIn, LogOut, User, ChevronDown, Building2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import AuthModal from "@/components/AuthModal";

interface NavLink {
  href: string;
  label: string;
  icon: React.ElementType;
  primary?: boolean;
}

const publicNavLinks: NavLink[] = [
  { href: "/marketplace", label: "Marketplace", icon: MapPin },
  { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
];

const authNavLink: NavLink = { href: "/daftarkan", label: "Daftarkan Material", icon: Plus, primary: true };

export default function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authTab, setAuthTab] = useState<"login" | "signup">("login");
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const { user, profile, loading, signOut } = useAuth();

  const openLogin = () => { setAuthTab("login"); setAuthModalOpen(true); setMenuOpen(false); };
  const openSignup = () => { setAuthTab("signup"); setAuthModalOpen(true); setMenuOpen(false); };

  // Close user dropdown when clicking outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const navLinks = user ? [...publicNavLinks, authNavLink] : publicNavLinks;
  const displayName = profile?.nama_penanggung_jawab || user?.email?.split("@")[0] || "Pengguna";
  const displayCompany = profile?.nama_perusahaan || "";
  const initials = displayName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <>
      <nav
        style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000,
          background: "rgba(8, 14, 26, 0.85)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 24px", height: "68px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>

          {/* Logo */}
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "linear-gradient(135deg, #10b981, #059669)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 20px rgba(16,185,129,0.4)" }}>
              <Recycle size={18} color="white" />
            </div>
            <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: "18px", color: "#f1f5f9", letterSpacing: "-0.5px" }}>
              Sisa<span style={{ background: "linear-gradient(135deg, #10b981, #06b6d4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Proyek</span>
            </span>
          </Link>

          {/* Live Badge */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px", background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: "100px", padding: "4px 10px" }}>
            <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#10b981", boxShadow: "0 0 6px #10b981", animation: "pulse 2s infinite" }} />
            <span style={{ fontSize: "11px", color: "#34d399", fontWeight: 600 }}>1.247 Listing Aktif</span>
          </div>

          {/* Desktop Nav */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }} className="hidden-mobile">
            {navLinks.map(({ href, label, icon: Icon, primary }) =>
              primary ? (
                <Link key={href} href={href} className="btn-primary"><Icon size={15} />{label}</Link>
              ) : (
                <Link key={href} href={href} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px", borderRadius: "10px", textDecoration: "none", fontSize: "14px", fontWeight: 500, color: pathname === href ? "#10b981" : "#94a3b8", background: pathname === href ? "rgba(16,185,129,0.1)" : "transparent", border: pathname === href ? "1px solid rgba(16,185,129,0.2)" : "1px solid transparent", transition: "all 0.2s ease" }}>
                  <Icon size={15} />{label}
                </Link>
              )
            )}

            {/* Auth Area */}
            {loading ? (
              <div style={{ width: "80px", height: "36px", background: "rgba(255,255,255,0.05)", borderRadius: "10px", animation: "shimmer 1.5s infinite" }} />
            ) : user ? (
              <div ref={userMenuRef} style={{ position: "relative" }}>
                <button
                  id="user-menu-btn"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  style={{ display: "flex", alignItems: "center", gap: "8px", padding: "6px 12px 6px 6px", background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: "12px", cursor: "pointer", transition: "all 0.2s" }}
                >
                  <div style={{ width: "30px", height: "30px", borderRadius: "8px", background: "linear-gradient(135deg,#10b981,#6366f1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 700, color: "white" }}>
                    {initials}
                  </div>
                  <div style={{ textAlign: "left" }}>
                    <p style={{ fontSize: "13px", fontWeight: 600, color: "#f1f5f9", lineHeight: 1 }}>{displayName}</p>
                    {displayCompany && <p style={{ fontSize: "11px", color: "#475569", marginTop: "2px", lineHeight: 1 }}>{displayCompany}</p>}
                  </div>
                  <ChevronDown size={13} color="#475569" style={{ transition: "transform 0.2s", transform: userMenuOpen ? "rotate(180deg)" : "none" }} />
                </button>

                {userMenuOpen && (
                  <div style={{ position: "absolute", right: 0, top: "calc(100% + 8px)", background: "#111827", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "8px", minWidth: "200px", boxShadow: "0 20px 40px rgba(0,0,0,0.5)", zIndex: 100, animation: "slideDown 0.15s ease" }}>
                    <div style={{ padding: "8px 12px 12px", borderBottom: "1px solid rgba(255,255,255,0.06)", marginBottom: "6px" }}>
                      <p style={{ fontSize: "12px", fontWeight: 700, color: "#f1f5f9" }}>{displayName}</p>
                      <p style={{ fontSize: "11px", color: "#475569", marginTop: "2px" }}>{user.email}</p>
                      {profile && (
                        <div style={{ display: "flex", alignItems: "center", gap: "4px", marginTop: "6px" }}>
                          <Building2 size={11} color="#10b981" />
                          <span style={{ fontSize: "11px", color: "#34d399" }}>{profile.tipe_perusahaan.replace(/_/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase())}</span>
                        </div>
                      )}
                    </div>
                    <button id="btn-signout" onClick={() => { signOut(); setUserMenuOpen(false); }} style={{ width: "100%", display: "flex", alignItems: "center", gap: "8px", padding: "8px 12px", background: "none", border: "none", borderRadius: "8px", color: "#f87171", cursor: "pointer", fontSize: "13px", fontWeight: 500, transition: "background 0.15s" }} onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(239,68,68,0.1)")} onMouseLeave={(e) => (e.currentTarget.style.background = "none")}>
                      <LogOut size={14} />Keluar
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ display: "flex", gap: "8px" }}>
                <button id="btn-login-nav" onClick={openLogin} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px", background: "transparent", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", color: "#94a3b8", cursor: "pointer", fontSize: "14px", fontWeight: 500, transition: "all 0.2s" }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(16,185,129,0.4)"; e.currentTarget.style.color = "#10b981"; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "#94a3b8"; }}>
                  <LogIn size={14} />Masuk
                </button>
                <button id="btn-signup-nav" onClick={openSignup} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px", background: "linear-gradient(135deg,#10b981,#059669)", border: "none", borderRadius: "10px", color: "white", cursor: "pointer", fontSize: "14px", fontWeight: 600, transition: "all 0.2s", boxShadow: "0 0 16px rgba(16,185,129,0.3)" }}>
                  <User size={14} />Daftar
                </button>
              </div>
            )}
          </div>

          {/* Mobile Toggle */}
          <button onClick={() => setMenuOpen(!menuOpen)} style={{ background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer", display: "none" }} className="show-mobile" aria-label="Toggle menu">
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "16px 24px", display: "flex", flexDirection: "column", gap: "8px" }}>
            {navLinks.map(({ href, label, icon: Icon, primary }) => (
              <Link key={href} href={href} onClick={() => setMenuOpen(false)} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 16px", borderRadius: "10px", textDecoration: "none", fontSize: "14px", fontWeight: 500, color: primary ? "#10b981" : "#94a3b8", background: primary ? "rgba(16,185,129,0.1)" : "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <Icon size={15} />{label}
              </Link>
            ))}
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "8px", marginTop: "4px", display: "flex", flexDirection: "column", gap: "8px" }}>
              {user ? (
                <>
                  <div style={{ padding: "12px 16px", background: "rgba(16,185,129,0.05)", border: "1px solid rgba(16,185,129,0.1)", borderRadius: "10px" }}>
                    <p style={{ fontSize: "13px", fontWeight: 600, color: "#f1f5f9" }}>{displayName}</p>
                    <p style={{ fontSize: "11px", color: "#475569", marginTop: "2px" }}>{user.email}</p>
                  </div>
                  <button onClick={() => { signOut(); setMenuOpen(false); }} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 16px", background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.1)", borderRadius: "10px", color: "#f87171", cursor: "pointer", fontSize: "14px", fontWeight: 500 }}>
                    <LogOut size={15} />Keluar
                  </button>
                </>
              ) : (
                <>
                  <button onClick={openLogin} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 16px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "10px", color: "#94a3b8", cursor: "pointer", fontSize: "14px", fontWeight: 500 }}>
                    <LogIn size={15} />Masuk
                  </button>
                  <button onClick={openSignup} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 16px", background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: "10px", color: "#34d399", cursor: "pointer", fontSize: "14px", fontWeight: 600 }}>
                    <User size={15} />Daftar Sekarang
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        <style>{`
          @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
          @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
          @keyframes slideDown { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
          @media (max-width: 768px) { .hidden-mobile { display: none !important; } .show-mobile { display: block !important; } }
          @media (min-width: 769px) { .show-mobile { display: none !important; } .hidden-mobile { display: flex !important; } }
        `}</style>
      </nav>

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} defaultTab={authTab} />
    </>
  );
}
