// ─── Domain Types ─────────────────────────────────────────────────────────────
// All runtime DATA now lives in Supabase (see supabase/schema.sql + seed.sql).
// This file only exports TypeScript types and static UI constants (colors/labels).

export type MaterialCategory = 'baja' | 'semen' | 'kayu' | 'keramik' | 'kaca' | 'bata' | 'pipa' | 'lainnya';
export type MaterialCondition = 'Sangat Baik' | 'Baik' | 'Cukup';
export type ListingStatus    = 'Tersedia' | 'Dalam Negosiasi' | 'Selesai';

export interface MaterialListing {
  id: string;
  title: string;
  category: MaterialCategory;
  weight: number;        // tons
  condition: MaterialCondition;
  status: ListingStatus;
  price: number;         // 0 = gratis
  priceUnit: 'per ton' | 'per m²' | 'per unit' | 'gratis';
  description: string;
  images: string[];
  seller: {
    name: string;
    type: 'Kontraktor Besar' | 'Pengembang' | 'Pabrik';
    verified: boolean;
    rating: number;
    projectName: string;
  };
  location: {
    city: string;
    province: string;
    address: string;
    lat: number;
    lng: number;
  };
  carbonSaved: number;   // tons CO2
  postedAt: string;
  expiresAt: string;
  views: number;
  inquiries: number;
}

export interface DashboardStats {
  totalWasteSaved:   number;
  co2Reduced:        number;
  totalTransactions: number;
  umkmHelped:        number;
  totalListings:     number;
  activeCities:      number;
}

export interface MonthlyCarbonEntry {
  month:   string;
  ton:     number;
  savings: number;
}

export interface CategoryBreakdownEntry {
  name:  string;
  value: number;
  color: string;
}

export interface TopCityEntry {
  city:     string;
  listings: number;
  saved:    number;
}

// ─── Static UI Constants (not data — these are display config) ────────────────

export const categoryColors: Record<MaterialCategory, string> = {
  baja:    '#6366f1',
  semen:   '#94a3b8',
  kayu:    '#10b981',
  keramik: '#f59e0b',
  kaca:    '#06b6d4',
  bata:    '#ef4444',
  pipa:    '#8b5cf6',
  lainnya: '#64748b',
};

export const categoryLabels: Record<MaterialCategory, string> = {
  baja:    'Baja & Besi',
  semen:   'Semen & Beton',
  kayu:    'Kayu & Timber',
  keramik: 'Keramik & Granit',
  kaca:    'Kaca & Aluminium',
  bata:    'Bata & Batako',
  pipa:    'Pipa & Sanitasi',
  lainnya: 'Material Lainnya',
};

export const categoryIcons: Record<MaterialCategory, string> = {
  baja:    '🏗️',
  semen:   '🧱',
  kayu:    '🪵',
  keramik: '⬜',
  kaca:    '🪟',
  bata:    '🏚️',
  pipa:    '🔧',
  lainnya: '📦',
};
