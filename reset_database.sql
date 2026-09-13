-- ========================================================
-- RISALE-I NUR OKUMA HALKASI - VERİTABANI SIFIRLAMA KODU
-- ========================================================
-- Bu kodu Supabase Dashboard -> SQL Editor kısmında çalıştırarak
-- tüm eski kayıtları silip veritabanını sıfırdan başlatabilirsiniz.

-- 1. Tüm okuma kayıtlarını sil
TRUNCATE TABLE public.reading_logs CASCADE;

-- 2. Tüm kullanıcı profillerini sil
TRUNCATE TABLE public.profiles CASCADE;

-- 3. Tüm üyelik e-posta hesaplarını sil (Sıfırla)
DELETE FROM auth.users;
