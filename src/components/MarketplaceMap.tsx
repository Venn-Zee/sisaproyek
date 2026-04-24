"use client";
import { useEffect, useRef } from "react";
import type { MaterialListing } from "@/lib/mockData";
import { categoryColors } from "@/lib/mockData";

interface Props {
  listings: MaterialListing[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  centerCity: [number, number];
}

export default function MarketplaceMap({
  listings,
  selectedId,
  onSelect,
  centerCity,
}: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<unknown>(null);
  const markersRef = useRef<Map<string, unknown>>(new Map());

  useEffect(() => {
    // Dynamically import Leaflet (SSR safe)
    import("leaflet").then((L) => {
      if (!mapRef.current || mapInstanceRef.current) return;

      // Fix default icon paths for Next.js
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        iconUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        shadowUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      });

      const map = L.map(mapRef.current!, {
        center: centerCity,
        zoom: 10,
        zoomControl: true,
        attributionControl: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap",
        maxZoom: 18,
      }).addTo(map);

      mapInstanceRef.current = map;

      // Add markers
      listings.forEach((listing) => {
        const color = categoryColors[listing.category];

        const icon = L.divIcon({
          html: `
            <div style="
              width: 36px; height: 36px;
              background: ${color};
              border: 3px solid rgba(255,255,255,0.9);
              border-radius: 50% 50% 50% 0;
              transform: rotate(-45deg);
              box-shadow: 0 4px 15px ${color}88, 0 2px 8px rgba(0,0,0,0.4);
              display: flex; align-items: center; justify-content: center;
              cursor: pointer;
            ">
              <span style="transform: rotate(45deg); font-size: 14px; line-height: 1;">
                ${getCategoryEmoji(listing.category)}
              </span>
            </div>
          `,
          className: "",
          iconSize: [36, 36],
          iconAnchor: [18, 36],
          popupAnchor: [0, -40],
        });

        const marker = L.marker(
          [listing.location.lat, listing.location.lng],
          { icon }
        );

        const priceLabel =
          listing.price === 0
            ? '<span style="color:#34d399;font-weight:700;font-size:16px;">GRATIS</span>'
            : `<span style="color:#fbbf24;font-weight:700;font-size:15px;">Rp ${listing.price.toLocaleString("id-ID")}<span style="font-size:11px;color:#64748b;font-weight:400"> / ${listing.priceUnit}</span></span>`;

        const statusColor =
          listing.status === "Tersedia"
            ? "#10b981"
            : listing.status === "Dalam Negosiasi"
            ? "#f59e0b"
            : "#64748b";

        marker.bindPopup(`
          <div style="font-family:'Inter',sans-serif; min-width:240px;">
            <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:${color};margin-bottom:6px;">
              ${listing.category.toUpperCase()} • ${listing.weight} Ton
            </div>
            <div style="font-size:14px;font-weight:700;color:#f1f5f9;margin-bottom:6px;line-height:1.4;">
              ${listing.title}
            </div>
            <div style="font-size:12px;color:#64748b;margin-bottom:10px;">
              📍 ${listing.location.city}, ${listing.location.province}
            </div>
            <div style="margin-bottom:10px;">${priceLabel}</div>
            <div style="display:flex;gap:6px;margin-bottom:12px;flex-wrap:wrap;">
              <span style="background:${statusColor}22;border:1px solid ${statusColor}44;color:${statusColor};font-size:10px;font-weight:600;padding:2px 8px;border-radius:100px;">
                ${listing.status}
              </span>
              <span style="background:rgba(16,185,129,0.15);border:1px solid rgba(16,185,129,0.25);color:#34d399;font-size:10px;font-weight:600;padding:2px 8px;border-radius:100px;">
                🌿 ${listing.carbonSaved}T CO₂ Saved
              </span>
            </div>
            <div style="font-size:12px;font-weight:600;color:#94a3b8;margin-bottom:4px;">
              ${listing.seller.name}
            </div>
            <button
              onclick="window.sisaProyekSelect && window.sisaProyekSelect('${listing.id}')"
              style="
                width:100%;margin-top:10px;padding:8px;
                background:linear-gradient(135deg,#10b981,#059669);
                color:white;font-weight:600;font-size:13px;
                border:none;border-radius:8px;cursor:pointer;
              "
            >
              Lihat Detail →
            </button>
          </div>
        `);

        marker.addTo(map);
        markersRef.current.set(listing.id, marker);

        marker.on("click", () => {
          onSelect(listing.id);
        });
      });

      // Global callback for popup button
      (window as unknown as Record<string, unknown>).sisaProyekSelect = onSelect;
    });

    return () => {
      if (mapInstanceRef.current) {
        (mapInstanceRef.current as { remove: () => void }).remove();
        mapInstanceRef.current = null;
        markersRef.current.clear();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update markers when listings change
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    // Pan to selected
    if (selectedId) {
      const listing = listings.find((l) => l.id === selectedId);
      if (listing) {
        (
          mapInstanceRef.current as {
            flyTo: (coords: [number, number], zoom: number, opts: object) => void;
          }
        ).flyTo([listing.location.lat, listing.location.lng], 13, {
          animate: true,
          duration: 1.2,
        });
        const marker = markersRef.current.get(selectedId);
        if (marker) {
          (marker as { openPopup: () => void }).openPopup();
        }
      }
    }
  }, [selectedId, listings]);

  // Pan to city center
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    (
      mapInstanceRef.current as {
        flyTo: (coords: [number, number], zoom: number, opts: object) => void;
      }
    ).flyTo(centerCity, 10, { animate: true, duration: 1 });
  }, [centerCity]);

  return (
    <>
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css"
      />
      <div
        ref={mapRef}
        style={{ width: "100%", height: "100%", background: "#0d1628" }}
        id="marketplace-map"
      />
    </>
  );
}

function getCategoryEmoji(cat: string): string {
  const map: Record<string, string> = {
    baja: "🏗",
    semen: "🧱",
    kayu: "🪵",
    keramik: "⬜",
    kaca: "🪟",
    bata: "🏚",
    pipa: "🔧",
    lainnya: "📦",
  };
  return map[cat] ?? "📦";
}
