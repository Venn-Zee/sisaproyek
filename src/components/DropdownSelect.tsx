"use client";
import { useState, useRef, useEffect, useId } from "react";
import { ChevronDown, MapPin } from "lucide-react";

interface DropdownSelectProps {
  id?: string;
  value: string;
  onChange: (val: string) => void;
  options: string[];
  placeholder?: string;
  disabled?: boolean;
  icon?: "mapPin" | "none";
}

export default function DropdownSelect({
  id,
  value,
  onChange,
  options,
  placeholder = "Pilih...",
  disabled = false,
  icon = "mapPin",
}: DropdownSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const uid = useId();
  const dropdownId = id ?? uid;

  // Close when clicking outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Focus search input when opened
  useEffect(() => {
    if (open && searchRef.current) {
      searchRef.current.focus();
    }
  }, [open]);

  const filtered = options.filter((opt) =>
    opt.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (opt: string) => {
    onChange(opt);
    setOpen(false);
    setSearch("");
  };

  const displayValue = value || placeholder;
  const hasValue = !!value;

  return (
    <div ref={containerRef} style={{ position: "relative", width: "100%" }} id={dropdownId}>
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => !disabled && setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="listbox"
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "10px 12px",
          background: "rgba(255,255,255,0.05)",
          border: `1px solid ${open ? "rgba(16,185,129,0.5)" : "rgba(255,255,255,0.1)"}`,
          borderRadius: "10px",
          color: hasValue ? "#f1f5f9" : "#475569",
          fontSize: "14px",
          cursor: disabled ? "not-allowed" : "pointer",
          opacity: disabled ? 0.5 : 1,
          transition: "border-color 0.2s, box-shadow 0.2s",
          boxShadow: open ? "0 0 0 2px rgba(16,185,129,0.15)" : "none",
          textAlign: "left",
        }}
      >
        {icon === "mapPin" && (
          <MapPin size={14} color="#475569" style={{ flexShrink: 0 }} />
        )}
        <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {displayValue}
        </span>
        <ChevronDown
          size={14}
          color="#475569"
          style={{
            flexShrink: 0,
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s",
          }}
        />
      </button>

      {/* Dropdown panel — always opens downward */}
      {open && (
        <div
          role="listbox"
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            left: 0,
            right: 0,
            zIndex: 9999,
            background: "rgba(15,23,42,0.97)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            border: "1px solid rgba(16,185,129,0.3)",
            borderRadius: "12px",
            boxShadow: "0 16px 48px rgba(0,0,0,0.6), 0 0 0 1px rgba(16,185,129,0.1)",
            overflow: "hidden",
          }}
        >
          {/* Search input */}
          {options.length > 8 && (
            <div style={{ padding: "8px 8px 4px" }}>
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari..."
                style={{
                  width: "100%",
                  padding: "7px 10px",
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                  color: "#f1f5f9",
                  fontSize: "13px",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>
          )}

          {/* Options list */}
          <ul
            style={{
              listStyle: "none",
              margin: 0,
              padding: "4px",
              maxHeight: "220px",
              overflowY: "auto",
              scrollbarWidth: "thin",
              scrollbarColor: "rgba(16,185,129,0.3) transparent",
            }}
          >
            {filtered.length === 0 ? (
              <li style={{ padding: "10px 12px", fontSize: "13px", color: "#475569", textAlign: "center" }}>
                Tidak ditemukan
              </li>
            ) : (
              filtered.map((opt) => (
                <li
                  key={opt}
                  role="option"
                  aria-selected={opt === value}
                  onClick={() => handleSelect(opt)}
                  style={{
                    padding: "9px 12px",
                    fontSize: "13px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    color: opt === value ? "#34d399" : "#e2e8f0",
                    background: opt === value ? "rgba(16,185,129,0.12)" : "transparent",
                    fontWeight: opt === value ? 600 : 400,
                    transition: "background 0.15s",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                  onMouseEnter={(e) => {
                    if (opt !== value) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)";
                  }}
                  onMouseLeave={(e) => {
                    if (opt !== value) (e.currentTarget as HTMLElement).style.background = "transparent";
                  }}
                >
                  {opt === value && (
                    <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#10b981", flexShrink: 0 }} />
                  )}
                  {opt}
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
