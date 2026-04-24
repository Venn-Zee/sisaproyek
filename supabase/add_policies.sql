-- ============================================================
-- SisaProyek — Tambahan RLS Policies
-- Jalankan di: Supabase Dashboard → SQL Editor → New Query
-- Diperlukan agar dashboard stats bisa diupdate saat listing baru masuk
-- ============================================================

-- dashboard_stats: izinkan UPDATE
CREATE POLICY "public_update_stats"
  ON dashboard_stats FOR UPDATE USING (TRUE) WITH CHECK (TRUE);

-- category_breakdown: izinkan DELETE + INSERT (untuk recalculate)
CREATE POLICY "public_delete_category"
  ON category_breakdown FOR DELETE USING (TRUE);

CREATE POLICY "public_insert_category"
  ON category_breakdown FOR INSERT WITH CHECK (TRUE);

-- top_cities: izinkan DELETE + INSERT (untuk recalculate)
CREATE POLICY "public_delete_cities"
  ON top_cities FOR DELETE USING (TRUE);

CREATE POLICY "public_insert_cities"
  ON top_cities FOR INSERT WITH CHECK (TRUE);
