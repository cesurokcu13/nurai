-- ========================================================
-- RISALE-I NUR OKUMA HALKASI - ÖRNEK VERİ YÜKLEME KODU
-- ========================================================
-- Bu SQL kodunu Supabase Dashboard -> SQL Editor kısmında çalıştırarak
-- sitenizdeki tablolara anında örnek okuma kayıtları yükleyebilirsiniz.

-- 1. Örnek Kullanıcı Profillerini Ekle
INSERT INTO public.profiles (id, color_nickname, badge_color) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Zümrüt Yeşil', '#10B981'),
  ('00000000-0000-0000-0000-000000000002', 'Safir Mavi', '#3B82F6'),
  ('00000000-0000-0000-0000-000000000003', 'Kehribar Sarı', '#F59E0B'),
  ('00000000-0000-0000-0000-000000000004', 'Mercan Turuncu', '#F97316'),
  ('00000000-0000-0000-0000-000000000005', 'Erguvan Mor', '#A855F7'),
  ('00000000-0000-0000-0000-000000000006', 'Akuamarin Deniz', '#14B8A6')
ON CONFLICT (id) DO NOTHING;

-- 2. Bugünkü Okuma Kayıtlarını Ekle
INSERT INTO public.reading_logs (user_id, log_date, page_count) VALUES
  ('00000000-0000-0000-0000-000000000001', CURRENT_DATE, 35),
  ('00000000-0000-0000-0000-000000000002', CURRENT_DATE, 25),
  ('00000000-0000-0000-0000-000000000003', CURRENT_DATE, 20),
  ('00000000-0000-0000-0000-000000000004', CURRENT_DATE, 15),
  ('00000000-0000-0000-0000-000000000005', CURRENT_DATE, 10),
  ('00000000-0000-0000-0000-000000000006', CURRENT_DATE, 40)
ON CONFLICT (user_id, log_date) DO UPDATE SET page_count = EXCLUDED.page_count;
