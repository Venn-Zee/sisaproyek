"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Recycle, MapPin, BarChart3, Plus, Menu, X, Zap } from "lucide-react";

const navLinks = [
  { href: "/marketplace", label: "Marketplace", icon: MapPin },
  { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/daftarkan", label: "Daftarkan Material", icon: Plus, primary: true },
];

export default function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        background: "rgba(8, 14, 26, 0.85)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "0 24px",
          height: "68px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Logo */}
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            textDecoration: "none",
          }}
        >
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              background: "linear-gradient(135deg, #10b981, #059669)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 20px rgba(16,185,129,0.4)",
            }}
          >
            <Recycle size={18} color="white" />
          </div>
          <div>
            <span
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 800,
                fontSize: "18px",
                color: "#f1f5f9",
                letterSpacing: "-0.5px",
              }}
            >
              Sisa
              <span
                style={{
                  background: "linear-gradient(135deg, #10b981, #06b6d4)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Proyek
              </span>
            </span>
          </div>
        </Link>

        {/* Live Badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            background: "rgba(16,185,129,0.1)",
            border: "1px solid rgba(16,185,129,0.2)",
            borderRadius: "100px",
            padding: "4px 10px",
          }}
        >
          <div
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: "#10b981",
              boxShadow: "0 0 6px #10b981",
              animation: "pulse 2s infinite",
            }}
          />
          <span style={{ fontSize: "11px", color: "#34d399", fontWeight: 600 }}>
            1.247 Listing Aktif
          </span>
        </div>

        {/* Desktop Nav */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
          className="hidden-mobile"
        >
          {navLinks.map(({ href, label, icon: Icon, primary }) =>
            primary ? (
              <Link key={href} href={href} className="btn-primary">
                <Icon size={15} />
                {label}
              </Link>
            ) : (
              <Link
                key={href}
                href={href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "8px 16px",
                  borderRadius: "10px",
                  textDecoration: "none",
                  fontSize: "14px",
                  fontWeight: 500,
                  color: pathname === href ? "#10b981" : "#94a3b8",
                  background:
                    pathname === href
                      ? "rgba(16,185,129,0.1)"
                      : "transparent",
                  border:
                    pathname === href
                      ? "1px solid rgba(16,185,129,0.2)"
                      : "1px solid transparent",
                  transition: "all 0.2s ease",
                }}
              >
                <Icon size={15} />
                {label}
              </Link>
            )
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          style={{
            background: "transparent",
            border: "none",
            color: "#94a3b8",
            cursor: "pointer",
            display: "none",
          }}
          className="show-mobile"
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div
          style={{
            borderTop: "1px solid rgba(255,255,255,0.06)",
            padding: "16px 24px",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          {navLinks.map(({ href, label, icon: Icon, primary }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMenuOpen(false)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "12px 16px",
                borderRadius: "10px",
                textDecoration: "none",
                fontSize: "14px",
                fontWeight: 500,
                color: primary ? "#10b981" : "#94a3b8",
                background: primary
                  ? "rgba(16,185,129,0.1)"
                  : "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <Icon size={15} />
              {label}
            </Link>
          ))}
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        @media (max-width: 768px) {
          .hidden-mobile { display: none !important; }
          .show-mobile { display: block !important; }
        }
        @media (min-width: 769px) {
          .show-mobile { display: none !important; }
          .hidden-mobile { display: flex !important; }
        }
      `}</style>
    </nav>
  );
}
