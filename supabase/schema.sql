-- ============================================================
-- SisaProyek — Supabase Database Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- ─── listings ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS listings (
  id                  TEXT PRIMARY KEY,
  title               TEXT NOT NULL,
  category            TEXT NOT NULL CHECK (category IN ('baja','semen','kayu','keramik','kaca','bata','pipa','lainnya')),
  weight              NUMERIC(10,2) NOT NULL,
  condition           TEXT NOT NULL CHECK (condition IN ('Sangat Baik','Baik','Cukup')),
  status              TEXT NOT NULL DEFAULT 'Tersedia' CHECK (status IN ('Tersedia','Dalam Negosiasi','Selesai')),
  price               NUMERIC(15,0) NOT NULL DEFAULT 0,
  price_unit          TEXT NOT NULL CHECK (price_unit IN ('per ton','per m²','per unit','gratis')),
  description         TEXT,
  images              TEXT[] DEFAULT '{}',

  -- seller (flattened)
  seller_name         TEXT NOT NULL,
  seller_type         TEXT NOT NULL CHECK (seller_type IN ('Kontraktor Besar','Pengembang','Pabrik')),
  seller_verified     BOOLEAN DEFAULT FALSE,
  seller_rating       NUMERIC(3,1),
  seller_project_name TEXT,

  -- location (flattened)
  location_city       TEXT NOT NULL,
  location_province   TEXT NOT NULL,
  location_address    TEXT,
  location_lat        NUMERIC(9,6) NOT NULL,
  location_lng        NUMERIC(9,6) NOT NULL,

  -- metrics
  carbon_saved        NUMERIC(10,2) DEFAULT 0,
  posted_at           DATE NOT NULL,
  expires_at          DATE NOT NULL,
  views               INTEGER DEFAULT 0,
  inquiries           INTEGER DEFAULT 0,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ─── dashboard_stats ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS dashboard_stats (
  id                  INTEGER PRIMARY KEY DEFAULT 1,
  total_waste_saved   NUMERIC(10,2),
  co2_reduced         NUMERIC(10,2),
  total_transactions  INTEGER,
  umkm_helped         INTEGER,
  total_listings      INTEGER,
  active_cities       INTEGER,
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ─── monthly_carbon_data ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS monthly_carbon_data (
  id        SERIAL PRIMARY KEY,
  month     TEXT NOT NULL,
  ton       NUMERIC(10,2) NOT NULL,
  savings   NUMERIC(15,0) NOT NULL
);

-- ─── category_breakdown ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS category_breakdown (
  id      SERIAL PRIMARY KEY,
  name    TEXT NOT NULL,
  value   INTEGER NOT NULL,
  color   TEXT NOT NULL
);

-- ─── top_cities ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS top_cities (
  id        SERIAL PRIMARY KEY,
  city      TEXT NOT NULL,
  listings  INTEGER NOT NULL,
  saved     NUMERIC(10,2) NOT NULL
);

-- ─── Row Level Security ───────────────────────────────────────────────────────
ALTER TABLE listings          ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_stats   ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_carbon_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE category_breakdown ENABLE ROW LEVEL SECURITY;
ALTER TABLE top_cities        ENABLE ROW LEVEL SECURITY;

-- Public read + insert for listings
CREATE POLICY "public_read_listings"   ON listings FOR SELECT USING (TRUE);
CREATE POLICY "public_insert_listings" ON listings FOR INSERT WITH CHECK (TRUE);

-- Public read for reference tables
CREATE POLICY "public_read_stats"    ON dashboard_stats     FOR SELECT USING (TRUE);
CREATE POLICY "public_read_monthly"  ON monthly_carbon_data FOR SELECT USING (TRUE);
CREATE POLICY "public_read_category" ON category_breakdown  FOR SELECT USING (TRUE);
CREATE POLICY "public_read_cities"   ON top_cities          FOR SELECT USING (TRUE);
