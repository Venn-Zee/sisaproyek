"use client";
import type { MaterialListing } from "@/lib/mockData";
import { categoryColors, categoryLabels, categoryIcons } from "@/lib/mockData";
import {
  MapPin,
  Weight,
  Leaf,
  Eye,
  MessageCircle,
  Star,
  CheckCircle,
  Clock,
} from "lucide-react";

interface Props {
  listing: MaterialListing;
  isSelected: boolean;
  onClick: () => void;
}

export default function MaterialCard({ listing, isSelected, onClick }: Props) {
  const color = categoryColors[listing.category];

  const statusBadge =
    listing.status === "Tersedia"
      ? { bg: "rgba(16,185,129,0.12)", border: "rgba(16,185,129,0.25)", color: "#34d399", label: "Tersedia" }
      : listing.status === "Dalam Negosiasi"
      ? { bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.25)", color: "#fbbf24", label: "Dalam Negosiasi" }
      : { bg: "rgba(100,116,139,0.12)", border: "rgba(100,116,139,0.25)", color: "#94a3b8", label: "Selesai" };

  return (
    <div
      onClick={onClick}
      style={{
        background: isSelected
          ? `linear-gradient(135deg, ${color}12, rgba(17,24,39,0.9))`
          : "rgba(17,24,39,0.7)",
        backdropFilter: "blur(12px)",
        border: `1px solid ${isSelected ? color + "50" : "rgba(255,255,255,0.07)"}`,
        borderRadius: "14px",
        padding: "16px",
        cursor: "pointer",
        transition: "all 0.25s ease",
        position: "relative",
        overflow: "hidden",
        flexShrink: 0,
      }}
    >
      {/* Left accent bar */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: "3px",
          background: color,
          borderRadius: "14px 0 0 14px",
          opacity: isSelected ? 1 : 0.4,
        }}
      />

      <div style={{ paddingLeft: "8px" }}>
        {/* Header row */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: "8px",
            marginBottom: "8px",
          }}
        >
          <div style={{ flex: 1 }}>
            {/* Category badge */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                background: `${color}18`,
                border: `1px solid ${color}30`,
                borderRadius: "100px",
                padding: "2px 8px",
                marginBottom: "6px",
                maxWidth: "100%",
              }}
            >
              <span style={{ fontSize: "10px", flexShrink: 0 }}>
                {categoryIcons[listing.category]}
              </span>
              <span
                style={{
                  fontSize: "10px",
                  fontWeight: 700,
                  color,
                  letterSpacing: "0.5px",
                  textTransform: "uppercase",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {categoryLabels[listing.category]}
              </span>
            </div>

            {/* Title */}
            <h3
              style={{
                fontSize: "13px",
                fontWeight: 700,
                color: "#f1f5f9",
                lineHeight: 1.4,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {listing.title}
            </h3>
          </div>

          {/* Weight pill */}
          <div
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "8px",
              padding: "4px 8px",
              textAlign: "center",
              flexShrink: 0,
            }}
          >
            <div
              style={{ fontSize: "14px", fontWeight: 800, color: "#f1f5f9" }}
            >
              {listing.weight}
            </div>
            <div style={{ fontSize: "9px", color: "#64748b", fontWeight: 600 }}>
              TON
            </div>
          </div>
        </div>

        {/* Location */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            marginBottom: "10px",
          }}
        >
          <MapPin size={11} color="#64748b" />
          <span style={{ fontSize: "11px", color: "#64748b" }}>
            {listing.location.city}, {listing.location.province}
          </span>
        </div>

        {/* Price + Status row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "10px",
          }}
        >
          <div>
            {listing.price === 0 ? (
              <span
                style={{
                  fontSize: "16px",
                  fontWeight: 800,
                  color: "#34d399",
                }}
              >
                GRATIS
              </span>
            ) : (
              <div>
                <span
                  style={{
                    fontSize: "14px",
                    fontWeight: 800,
                    color: "#fbbf24",
                  }}
                >
                  Rp {listing.price.toLocaleString("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span style={{ fontSize: "10px", color: "#94a3b8" }}>
                  {" "}
                  / {listing.priceUnit}
                </span>
              </div>
            )}
          </div>
          <div
            style={{
              background: statusBadge.bg,
              border: `1px solid ${statusBadge.border}`,
              color: statusBadge.color,
              fontSize: "10px",
              fontWeight: 700,
              padding: "3px 8px",
              borderRadius: "100px",
            }}
          >
            {statusBadge.label}
          </div>
        </div>

        {/* Carbon saved */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            background: "rgba(16,185,129,0.06)",
            border: "1px solid rgba(16,185,129,0.12)",
            borderRadius: "8px",
            padding: "6px 10px",
            marginBottom: "10px",
          }}
        >
          <Leaf size={12} color="#10b981" />
          <span style={{ fontSize: "11px", color: "#34d399", fontWeight: 600 }}>
            Hemat {listing.carbonSaved} Ton CO₂
          </span>
        </div>

        {/* Seller + Stats */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            {listing.seller.verified && (
              <CheckCircle size={11} color="#10b981" />
            )}
            <span
              style={{
                fontSize: "11px",
                color: "#475569",
                fontWeight: 500,
              }}
            >
              {listing.seller.name.length > 20
                ? listing.seller.name.slice(0, 20) + "…"
                : listing.seller.name}
            </span>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: "3px",
                fontSize: "10px",
                color: "#334155",
              }}
            >
              <Eye size={10} /> {listing.views}
            </span>
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: "3px",
                fontSize: "10px",
                color: "#334155",
              }}
            >
              <MessageCircle size={10} /> {listing.inquiries}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
