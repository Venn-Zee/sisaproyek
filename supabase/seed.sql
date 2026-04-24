-- ============================================================
-- SisaProyek — Seed Data
-- Run AFTER schema.sql in: Supabase Dashboard → SQL Editor
-- ============================================================

-- ─── listings ────────────────────────────────────────────────────────────────
INSERT INTO listings (
  id, title, category, weight, condition, status, price, price_unit, description,
  seller_name, seller_type, seller_verified, seller_rating, seller_project_name,
  location_city, location_province, location_address, location_lat, location_lng,
  carbon_saved, posted_at, expires_at, views, inquiries
) VALUES
(
  'SP-001',
  'Baja Struktural H-Beam Sisa Proyek Gedung 30 Lantai',
  'baja', 45, 'Sangat Baik', 'Tersedia', 8500000, 'per ton',
  'Sisa baja H-Beam dari proyek menara perkantoran di Sudirman. Kualitas premium, masih bersertifikat SNI. Cocok untuk konstruksi gedung bertingkat, jembatan, atau gudang industri. Tersedia dalam berbagai ukuran: 150x150mm, 200x200mm.',
  'PT Wijaya Karya Beton', 'Kontraktor Besar', TRUE, 4.9, 'Sudirman Grand Tower Phase 2',
  'Jakarta Selatan', 'DKI Jakarta', 'Jl. Jend. Sudirman Kav 52-53', -6.214600, 106.808300,
  112.5, '2026-04-01', '2026-06-01', 1247, 34
),
(
  'SP-002',
  'Keramik Granit 60x60 Import — 2.400 m² Sisa Finishing',
  'keramik', 8.5, 'Sangat Baik', 'Tersedia', 85000, 'per m²',
  'Keramik granit impor dari Italia, motif marmer putih. Sisa finishing apartemen 40 lantai. Masih dalam kemasan asli, belum terbuka. Harga pasar Rp 350.000/m². Minimum pembelian 100 m².',
  'PT Agung Sedayu Group', 'Pengembang', TRUE, 4.7, 'Pantai Indah Kapuk 2 Residences',
  'Jakarta Utara', 'DKI Jakarta', 'Jl. Pantai Indah Kapuk, Penjaringan', -6.119100, 106.746500,
  21.25, '2026-04-05', '2026-05-31', 892, 19
),
(
  'SP-003',
  'Kayu Bekisting Sengon Laut — 80 Ton GRATIS Ambil Sendiri',
  'kayu', 80, 'Cukup', 'Tersedia', 0, 'gratis',
  'Kayu bekisting sisa cor beton, kondisi masih cukup baik untuk digunakan kembali sebagai bekisting atau material non-struktural. GRATIS, syarat harus ambil sendiri dengan armada truk. Tersedia selama persediaan masih ada. Waktu pengambilan max 2 minggu.',
  'PT Pembangunan Perumahan (PP)', 'Kontraktor Besar', TRUE, 4.8, 'Tol Becakayu Seksi 2B',
  'Bekasi', 'Jawa Barat', 'Basecamp Proyek, Jl. Inspeksi Kalimalang KM 5', -6.234900, 106.992300,
  160, '2026-04-08', '2026-04-30', 2103, 67
),
(
  'SP-004',
  'Semen Portland Tipe I — 500 Sak 50kg Mendekati Expired',
  'semen', 25, 'Baik', 'Tersedia', 45000, 'per unit',
  'Semen Portland Tipe I merk Holcim, sisa pengecoran fondasi. Kemasan masih utuh, belum kena air. Expire 3 bulan lagi, masih sangat layak pakai untuk konstruksi non-high-rise. Dijual per sak, minimum 50 sak.',
  'PT Nusa Konstruksi Enjiniring', 'Kontraktor Besar', TRUE, 4.6, 'Bendungan Semantok Nganjuk',
  'Surabaya', 'Jawa Timur', 'Gudang Material, Jl. Rungkut Industri III No. 45', -7.321300, 112.757800,
  37.5, '2026-04-10', '2026-05-10', 654, 12
),
(
  'SP-005',
  'Pipa HDPE Ø 315mm — 2.000 meter Sisa Jaringan Air',
  'pipa', 18, 'Sangat Baik', 'Dalam Negosiasi', 125000, 'per unit',
  'Pipa HDPE pressure rating PN 10, diameter 315mm. Sisa proyek jaringan air bersih PDAM. Belum pernah digunakan, masih tersegel. Sangat cocok untuk irigasi pertanian, sistem drainase, atau proyek infrastruktur air skala menengah.',
  'PT Hutama Karya Infrastruktur', 'Kontraktor Besar', TRUE, 4.9, 'SPAM Regional Brebes-Tegal',
  'Semarang', 'Jawa Tengah', 'Gudang Logistik, Kawasan Industri Terboyo', -6.983900, 110.421100,
  45, '2026-03-28', '2026-05-28', 431, 8
),
(
  'SP-006',
  'Bata Merah Press Lokal — 150.000 Biji Sisa Pembangunan Pabrik',
  'bata', 300, 'Sangat Baik', 'Tersedia', 750, 'per unit',
  'Bata merah press berkualitas tinggi dari pabrik lokal Majalaya. Sisa pembangunan pabrik tekstil. Dimensi standar 23x11x5 cm. Harga pasar Rp 1.200/biji. Cocok untuk rumah tinggal, ruko, atau pagar. Bisa diantar dengan armada pabrik radius 50 km.',
  'PT Bandung Inti Graha', 'Pengembang', FALSE, 4.3, 'Pabrik Tekstil Modern Majalaya',
  'Bandung', 'Jawa Barat', 'Jl. Raya Majalaya KM 3, Kab. Bandung', -7.005100, 107.763300,
  210, '2026-04-12', '2026-07-12', 1876, 45
),
(
  'SP-007',
  'Kaca Tempered 12mm — 800 lembar (1.2m x 2.4m) Sisa Curtain Wall',
  'kaca', 22, 'Baik', 'Tersedia', 450000, 'per unit',
  'Kaca tempered 12mm clear, ukuran 1.2x2.4m. Sisa pemasangan curtain wall gedung kantor di Mega Kuningan. Beberapa lembar ada edge chip minor yang tidak mengganggu fungsi. Sangat cocok untuk partisi kantor, showroom, atau fasad bangunan komersial.',
  'PT Total Bangun Persada', 'Kontraktor Besar', TRUE, 4.8, 'Mega Kuningan Office Park Tower C',
  'Jakarta Selatan', 'DKI Jakarta', 'Jl. Mega Kuningan Barat, Kuningan', -6.229700, 106.819800,
  55, '2026-04-14', '2026-06-14', 567, 15
),
(
  'SP-008',
  'Rangka Baja Ringan C-75 — 8 Ton Sisa Atap Pergudangan',
  'baja', 8, 'Sangat Baik', 'Tersedia', 12000000, 'per ton',
  'Baja ringan profil C-75 ketebalan 0.75mm merk Trisomet. Sisa pemasangan atap gudang logistik. Masih dalam bundle asli, belum dipotong. Sangat efisien untuk atap rumah, carport, atau bangunan pertanian.',
  'PT Ciputra Group', 'Pengembang', TRUE, 4.7, 'Cibitung Integrated Township',
  'Cikarang', 'Jawa Barat', 'Kawasan Industri MM2100, Cibitung', -6.313300, 107.145400,
  20, '2026-04-15', '2026-05-30', 389, 9
),
(
  'SP-009',
  'Pasir Silika Halus Sisa Sandblasting — 30 Ton',
  'lainnya', 30, 'Baik', 'Tersedia', 350000, 'per ton',
  'Pasir silika mesh 20-40 sisa proses sandblasting permukaan baja. Bersih dari kontaminan. Bisa digunakan untuk campuran beton kedap air, filter air, atau abu pasir taman. Ambil di lokasi atau kami siapkan jasa angkut.',
  'PT Krakatau Steel', 'Pabrik', TRUE, 4.9, 'Maintenance Plant Expansion 2026',
  'Cilegon', 'Banten', 'Jl. Industri No. 5, Kawasan Industri Krakatau', -6.008300, 106.028300,
  15, '2026-04-16', '2026-06-30', 211, 4
),
(
  'SP-010',
  'Kayu Merbau Olahan Solid — 15 Ton Sisa Flooring Bandara',
  'kayu', 15, 'Sangat Baik', 'Tersedia', 14000000, 'per ton',
  'Kayu Merbau solid grading premium, ukuran 20x3cm, panjang bervariasi 1.5-3m. Sisa pemasangan flooring terminal baru bandara. Kayu keras tropis yang sangat kuat dan tahan air. Sangat cocok untuk decking, furniture high-end, atau parket.',
  'PT Adhi Karya', 'Kontraktor Besar', TRUE, 4.8, 'Pengembangan Bandara Kertajati Phase 3',
  'Majalengka', 'Jawa Barat', 'Basecamp Proyek Bandara Kertajati', -6.647900, 108.163900,
  52.5, '2026-04-17', '2026-06-17', 743, 22
);

-- ─── dashboard_stats ─────────────────────────────────────────────────────────
INSERT INTO dashboard_stats (id, total_waste_saved, co2_reduced, total_transactions, umkm_helped, total_listings, active_cities)
VALUES (1, 847.3, 338.9, 312, 89, 1247, 28)
ON CONFLICT (id) DO UPDATE SET
  total_waste_saved  = EXCLUDED.total_waste_saved,
  co2_reduced        = EXCLUDED.co2_reduced,
  total_transactions = EXCLUDED.total_transactions,
  umkm_helped        = EXCLUDED.umkm_helped,
  total_listings     = EXCLUDED.total_listings,
  active_cities      = EXCLUDED.active_cities,
  updated_at         = NOW();

-- ─── monthly_carbon_data ─────────────────────────────────────────────────────
INSERT INTO monthly_carbon_data (month, ton, savings) VALUES
  ('Sep 2025', 18.2, 182000000),
  ('Okt 2025', 24.7, 247000000),
  ('Nov 2025', 31.5, 315000000),
  ('Des 2025', 28.9, 289000000),
  ('Jan 2026', 42.3, 423000000),
  ('Feb 2026', 51.8, 518000000),
  ('Mar 2026', 67.4, 674000000),
  ('Apr 2026', 74.1, 741000000);

-- ─── category_breakdown ──────────────────────────────────────────────────────
INSERT INTO category_breakdown (name, value, color) VALUES
  ('Baja',    32, '#6366f1'),
  ('Kayu',    24, '#10b981'),
  ('Keramik', 18, '#f59e0b'),
  ('Semen',   12, '#64748b'),
  ('Bata',     8, '#ef4444'),
  ('Lainnya',  6, '#8b5cf6');

-- ─── top_cities ──────────────────────────────────────────────────────────────
INSERT INTO top_cities (city, listings, saved) VALUES
  ('Jakarta',  287, 215.4),
  ('Surabaya', 198, 148.7),
  ('Bandung',  156, 121.3),
  ('Semarang', 134,  98.6),
  ('Bekasi',   112,  87.2),
  ('Cikarang',  89,  71.5);
