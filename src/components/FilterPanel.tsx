"use client";
import { useState } from "react";
import { Search, SlidersHorizontal, X, ChevronDown } from "lucide-react";
import type { MaterialCategory } from "@/lib/mockData";
import { categoryLabels, categoryIcons, categoryColors } from "@/lib/mockData";

const CITIES = [
  { label: "Semua Kota", coords: [-6.2088, 106.8456] as [number, number] },
  { label: "Jakarta", coords: [-6.2088, 106.8456] as [number, number] },
  { label: "Surabaya", coords: [-7.2575, 112.7521] as [number, number] },
  { label: "Bandung", coords: [-6.9175, 107.6191] as [number, number] },
  { label: "Semarang", coords: [-6.9932, 110.4229] as [number, number] },
  { label: "Bekasi", coords: [-6.2349, 106.9923] as [number, number] },
  { label: "Cikarang", coords: [-6.3133, 107.1454] as [number, number] },
  { label: "Cilegon", coords: [-6.0083, 106.0283] as [number, number] },
  { label: "Majalengka", coords: [-6.6479, 108.1639] as [number, number] },
];

const CATEGORIES: MaterialCategory[] = [
  "baja", "semen", "kayu", "keramik", "kaca", "bata", "pipa", "lainnya"
];

interface Props {
  search: string;
  onSearch: (v: string) => void;
  selectedCategories: MaterialCategory[];
  onToggleCategory: (cat: MaterialCategory) => void;
  selectedCity: string;
  onCityChange: (city: string, coords: [number, number]) => void;
  maxPrice: number;
  onMaxPrice: (v: number) => void;
  totalShown: number;
  totalAll: number;
}

export default function FilterPanel({
  search, onSearch,
  selectedCategories, onToggleCategory,
  selectedCity, onCityChange,
  maxPrice, onMaxPrice,
  totalShown, totalAll,
}: Props) {
  const [showPrice, setShowPrice] = useState(false);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      {/* Search */}
      <div style={{ position: "relative" }}>
        <Search
          size={15}
          color="#64748b"
          style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }}
        />
        <input
          type="text"
          placeholder="Cari material, kota, kontraktor..."
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          className="input-field"
          style={{ paddingLeft: "36px", paddingRight: search ? "36px" : "12px" }}
          id="filter-search"
        />
        {search && (
          <button
            onClick={() => onSearch("")}
            style={{
              position: "absolute", right: "10px", top: "50%",
              transform: "translateY(-50%)", background: "transparent",
              border: "none", cursor: "pointer", color: "#64748b",
              display: "flex", alignItems: "center",
            }}
            aria-label="Clear search"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* City Filter */}
      <div>
        <label style={{ fontSize: "11px", fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: "6px" }}>
          Kota / Wilayah
        </label>
        <div style={{ position: "relative" }}>
          <select
            value={selectedCity}
            onChange={(e) => {
              const city = CITIES.find((c) => c.label === e.target.value);
              if (city) onCityChange(city.label, city.coords);
            }}
            className="input-field"
            style={{ appearance: "none", paddingRight: "32px", cursor: "pointer" }}
            id="filter-city"
          >
            {CITIES.map((c) => (
              <option key={c.label} value={c.label} style={{ background: "#111827" }}>
                {c.label}
              </option>
            ))}
          </select>
          <ChevronDown
            size={14}
            color="#64748b"
            style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
          />
        </div>
      </div>

      {/* Category Filter */}
      <div>
        <label style={{ fontSize: "11px", fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: "8px" }}>
          Kategori Material
        </label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
          {CATEGORIES.map((cat) => {
            const active = selectedCategories.includes(cat);
            const color = categoryColors[cat];
            return (
              <button
                key={cat}
                onClick={() => onToggleCategory(cat)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  padding: "5px 10px",
                  borderRadius: "100px",
                  border: `1px solid ${active ? color + "60" : "rgba(255,255,255,0.08)"}`,
                  background: active ? `${color}18` : "rgba(255,255,255,0.03)",
                  color: active ? color : "#64748b",
                  fontSize: "11px",
                  fontWeight: active ? 700 : 500,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                id={`filter-cat-${cat}`}
              >
                <span>{categoryIcons[cat]}</span>
                {categoryLabels[cat].split(" ")[0]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Price Filter */}
      <div>
        <button
          onClick={() => setShowPrice(!showPrice)}
          style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            width: "100%", background: "transparent", border: "none", cursor: "pointer",
            padding: "0",
          }}
        >
          <label style={{ fontSize: "11px", fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.5px", cursor: "pointer" }}>
            Harga Maks per Ton
          </label>
          <ChevronDown
            size={14}
            color="#475569"
            style={{ transform: showPrice ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s" }}
          />
        </button>
        {showPrice && (
          <div style={{ marginTop: "8px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
              <span style={{ fontSize: "12px", color: "#64748b" }}>Gratis</span>
              <span style={{ fontSize: "12px", color: "#fbbf24", fontWeight: 700 }}>
                {maxPrice === 20000000 ? "Semua" : `Rp ${maxPrice.toLocaleString("id-ID")}`}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={20000000}
              step={500000}
              value={maxPrice}
              onChange={(e) => onMaxPrice(Number(e.target.value))}
              style={{ width: "100%", accentColor: "#10b981" }}
              id="filter-price-slider"
            />
          </div>
        )}
      </div>

      {/* Result count */}
      <div
        style={{
          background: "rgba(16,185,129,0.06)",
          border: "1px solid rgba(16,185,129,0.12)",
          borderRadius: "10px",
          padding: "10px 12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span style={{ fontSize: "12px", color: "#64748b" }}>Menampilkan</span>
        <span style={{ fontSize: "13px", fontWeight: 700, color: "#10b981" }}>
          {totalShown} dari {totalAll} listing
        </span>
      </div>
    </div>
  );
}
