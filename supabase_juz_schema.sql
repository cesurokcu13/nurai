-- ========================================================
-- RISALE-I NUR OKUMA HALKASI - CÜZ & ORTAK HATİM TAKİBİ ŞEMASI
-- ========================================================

-- 1. HATİM DÖNGÜLERİ (HATIM ROUNDS) TABLOSU
CREATE TABLE IF NOT EXISTS public.hatim_rounds (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  round_number INT NOT NULL DEFAULT 1,
  title TEXT NOT NULL DEFAULT 'Hatm-i Şerif',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- 2. CÜZ ATAMALARI & DURUMLARI (JUZ ASSIGNMENTS) TABLOSU
CREATE TABLE IF NOT EXISTS public.juz_assignments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  round_id UUID REFERENCES public.hatim_rounds(id) ON DELETE CASCADE NOT NULL,
  juz_number INT NOT NULL CHECK (juz_number BETWEEN 1 AND 30),
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'taken', 'completed')),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  taken_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(round_id, juz_number)
);

-- 3. İNDEKSLER (HIZLI SORGULAMA İÇİN)
CREATE INDEX IF NOT EXISTS idx_hatim_rounds_status ON public.hatim_rounds(status);
CREATE INDEX IF NOT EXISTS idx_hatim_rounds_round_no ON public.hatim_rounds(round_number);
CREATE INDEX IF NOT EXISTS idx_juz_round_status ON public.juz_assignments(round_id, status);
CREATE INDEX IF NOT EXISTS idx_juz_user_id ON public.juz_assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_juz_number ON public.juz_assignments(juz_number);

-- 4. HATİM TAMAMLANMA VE DURUM TETİKLEYİCİSİ (TRIGGER)
CREATE OR REPLACE FUNCTION public.check_hatim_round_completion()
RETURNS TRIGGER AS $$
DECLARE
  v_round_id UUID;
  v_completed_count INT;
BEGIN
  v_round_id := NEW.round_id;

  SELECT COUNT(*)
  INTO v_completed_count
  FROM public.juz_assignments
  WHERE round_id = v_round_id AND status = 'completed';

  -- 30 cüzün tamamı okunduysa hatim statüsünü 'completed' yap
  IF v_completed_count >= 30 THEN
    UPDATE public.hatim_rounds
    SET status = 'completed', completed_at = timezone('utc'::text, now())
    WHERE id = v_round_id AND status = 'active';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_check_hatim_round_completion ON public.juz_assignments;
CREATE TRIGGER trigger_check_hatim_round_completion
  AFTER INSERT OR UPDATE ON public.juz_assignments
  FOR EACH ROW
  EXECUTE FUNCTION public.check_hatim_round_completion();

-- 5. ROW LEVEL SECURITY (RLS) POLİTİKALARI
ALTER TABLE public.hatim_rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.juz_assignments ENABLE ROW LEVEL SECURITY;

-- Hatim Rounds Politikaları
-- Herkes hatimleri görebilir
DROP POLICY IF EXISTS "Herkes hatimleri gorebilir" ON public.hatim_rounds;
CREATE POLICY "Herkes hatimleri gorebilir"
  ON public.hatim_rounds FOR SELECT
  USING ( true );

-- Giriş yapmış kullanıcılar yeni hatim başlatabilir
DROP POLICY IF EXISTS "Giris yapmis herkes hatim baslatabilir" ON public.hatim_rounds;
CREATE POLICY "Giris yapmis herkes hatim baslatabilir"
  ON public.hatim_rounds FOR INSERT
  WITH CHECK ( auth.role() = 'authenticated' );

-- Giriş yapmış kullanıcılar hatim güncelleyebilir
DROP POLICY IF EXISTS "Giris yapmis herkes hatim guncelleyebilir" ON public.hatim_rounds;
CREATE POLICY "Giris yapmis herkes hatim guncelleyebilir"
  ON public.hatim_rounds FOR UPDATE
  USING ( auth.role() = 'authenticated' );

-- Juz Assignments Politikaları
-- Herkes cüz durumlarını görebilir
DROP POLICY IF EXISTS "Herkes cuz durumlarini gorebilir" ON public.juz_assignments;
CREATE POLICY "Herkes cuz durumlarini gorebilir"
  ON public.juz_assignments FOR SELECT
  USING ( true );

-- Giriş yapmış kullanıcılar cüz kayıtları oluşturabilir
DROP POLICY IF EXISTS "Giris yapmis herkes cuz ekleyebilir" ON public.juz_assignments;
CREATE POLICY "Giris yapmis herkes cuz ekleyebilir"
  ON public.juz_assignments FOR INSERT
  WITH CHECK ( auth.role() = 'authenticated' );

-- Giriş yapmış kullanıcılar cüz alabilir ve durumunu güncelleyebilir
DROP POLICY IF EXISTS "Giris yapmis herkes cuz alabilir ve tamamlayabilir" ON public.juz_assignments;
CREATE POLICY "Giris yapmis herkes cuz alabilir ve tamamlayabilir"
  ON public.juz_assignments FOR UPDATE
  USING ( auth.role() = 'authenticated' )
  WITH CHECK ( auth.role() = 'authenticated' );
