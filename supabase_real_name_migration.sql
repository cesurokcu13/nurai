-- ========================================================
-- MİGRASYON: profiles tablosuna real_name sütunu ekle
-- ========================================================
-- Bu SQL'i Supabase Dashboard > SQL Editor'da çalıştırın.
-- Görev panosunda her seferinde isim sormaması için gerekli.

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS real_name TEXT;

-- Mevcut kullanıcıların varsa localStorage'daki isimlerini
-- manuel olarak girebilirsiniz, ya da uygulama üzerinden
-- ilk görev tamamlamada otomatik kaydedilecektir.
