-- ============================================================
-- SisaProyek — User Profiles Table
-- Jalankan script ini di Supabase Dashboard > SQL Editor
-- ============================================================

-- 1. Buat tabel user_profiles
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id                    UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email                 TEXT NOT NULL,
  nama_penanggung_jawab TEXT NOT NULL,
  nama_perusahaan       TEXT NOT NULL,
  tipe_perusahaan       TEXT NOT NULL CHECK (
    tipe_perusahaan IN ('kontraktor_besar', 'pengembang', 'pabrik_manufaktur', 'bumn', 'lainnya')
  ),
  provinsi              TEXT NOT NULL,
  kota                  TEXT NOT NULL,
  created_at            TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Aktifkan Row Level Security
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- 3. Policy: user hanya bisa baca profil sendiri
CREATE POLICY "user_view_own_profile"
  ON public.user_profiles
  FOR SELECT
  USING (auth.uid() = id);

-- 4. Policy: user bisa insert profil sendiri
CREATE POLICY "user_insert_own_profile"
  ON public.user_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 5. Policy: user bisa update profil sendiri
CREATE POLICY "user_update_own_profile"
  ON public.user_profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- 6. (Opsional) Index untuk performa query berdasarkan provinsi/kota
CREATE INDEX IF NOT EXISTS idx_user_profiles_provinsi ON public.user_profiles (provinsi);
CREATE INDEX IF NOT EXISTS idx_user_profiles_tipe ON public.user_profiles (tipe_perusahaan);

-- Selesai! Tabel user_profiles siap digunakan.
