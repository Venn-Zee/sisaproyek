"use client";
import { useEffect, useRef, useCallback } from "react";

interface MapPickerProps {
  lat: number;
  lng: number;
  onChange: (lat: number, lng: number) => void;
}

// Center of Indonesia as default
const DEFAULT_LAT = -2.5;
const DEFAULT_LNG = 118.0;
const DEFAULT_ZOOM = 5;

export default function MapPicker({ lat, lng, onChange }: MapPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInstanceRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markerRef = useRef<any>(null);

  const handleChange = useCallback(onChange, [onChange]);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Dynamically import Leaflet (SSR-safe)
    import("leaflet").then((L) => {
      // Fix default icon paths
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const initLat = lat || DEFAULT_LAT;
      const initLng = lng || DEFAULT_LNG;
      const initZoom = lat ? 13 : DEFAULT_ZOOM;

      const map = L.map(mapRef.current!, {
        center: [initLat, initLng],
        zoom: initZoom,
        zoomControl: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap",
        maxZoom: 19,
      }).addTo(map);

      // Custom green marker icon
      const greenIcon = L.divIcon({
        html: `
          <div style="
            width:32px;height:42px;position:relative;
          ">
            <div style="
              width:28px;height:28px;
              background:linear-gradient(135deg,#10b981,#059669);
              border:3px solid white;
              border-radius:50% 50% 50% 0;
              transform:rotate(-45deg);
              box-shadow:0 4px 12px rgba(16,185,129,0.5);
              position:absolute;top:0;left:2px;
            "></div>
            <div style="
              width:8px;height:8px;
              background:white;
              border-radius:50%;
              position:absolute;top:10px;left:12px;
            "></div>
          </div>
        `,
        className: "",
        iconSize: [32, 42],
        iconAnchor: [16, 42],
        popupAnchor: [0, -44],
      });

      // Create marker only if lat/lng provided, else place on first click
      if (lat && lng) {
        const marker = L.marker([lat, lng], {
          icon: greenIcon,
          draggable: true,
        }).addTo(map);
        marker.on("dragend", () => {
          const pos = marker.getLatLng();
          handleChange(pos.lat, pos.lng);
        });
        markerRef.current = marker;
      }

      // Click on map to place/move marker
      map.on("click", (e: L.LeafletMouseEvent) => {
        const { lat: clickLat, lng: clickLng } = e.latlng;
        if (markerRef.current) {
          markerRef.current.setLatLng([clickLat, clickLng]);
        } else {
          const marker = L.marker([clickLat, clickLng], {
            icon: greenIcon,
            draggable: true,
          }).addTo(map);
          marker.on("dragend", () => {
            const pos = marker.getLatLng();
            handleChange(pos.lat, pos.lng);
          });
          markerRef.current = marker;
        }
        handleChange(clickLat, clickLng);
      });

      mapInstanceRef.current = map;
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
      }
    };
    // Only run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When lat/lng changes externally (e.g. GPS auto-locate), pan map and update marker
  useEffect(() => {
    if (!mapInstanceRef.current || !lat || !lng) return;
    import("leaflet").then((L) => {
      const map = mapInstanceRef.current;
      map.setView([lat, lng], 15, { animate: true });
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      } else {
        const greenIcon = L.divIcon({
          html: `
            <div style="width:32px;height:42px;position:relative;">
              <div style="
                width:28px;height:28px;
                background:linear-gradient(135deg,#10b981,#059669);
                border:3px solid white;
                border-radius:50% 50% 50% 0;
                transform:rotate(-45deg);
                box-shadow:0 4px 12px rgba(16,185,129,0.5);
                position:absolute;top:0;left:2px;
              "></div>
              <div style="
                width:8px;height:8px;
                background:white;
                border-radius:50%;
                position:absolute;top:10px;left:12px;
              "></div>
            </div>
          `,
          className: "",
          iconSize: [32, 42],
          iconAnchor: [16, 42],
        });
        const marker = L.marker([lat, lng], { icon: greenIcon, draggable: true }).addTo(map);
        marker.on("dragend", () => {
          const pos = marker.getLatLng();
          handleChange(pos.lat, pos.lng);
        });
        markerRef.current = marker;
      }
    });
  }, [lat, lng, handleChange]);

  return (
    <div
      ref={mapRef}
      style={{
        width: "100%",
        height: "320px",
        borderRadius: "12px",
        overflow: "hidden",
        border: "1px solid rgba(16,185,129,0.25)",
        boxShadow: "0 0 24px rgba(16,185,129,0.08)",
      }}
    />
  );
}
