-- ========================================================
-- RISALE-I NUR OKUMA HALKASI - SUPABASE DATABASE SCHEMAS
-- ========================================================

-- 1. Create Profiles Table (Anonim Kullanıcı Renk Kimlikleri)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  color_nickname TEXT NOT NULL,
  badge_color TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create Reading Logs Table (Okunan Sayfa Kayıtları)
CREATE TABLE IF NOT EXISTS public.reading_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  log_date DATE NOT NULL,
  page_count INT NOT NULL CHECK (page_count > 0),
  book_title TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, log_date)
);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reading_logs ENABLE ROW LEVEL SECURITY;

-- 4. RLS POLICIES FOR PROFILES
-- Anyone can view public color nicknames & badges (e-mails are stored separately in auth.users and NEVER exposed)
CREATE POLICY "Public profiles are viewable by everyone."
  ON public.profiles FOR SELECT
  USING ( true );

-- Users can insert/update their own profile
CREATE POLICY "Users can insert their own profile."
  ON public.profiles FOR INSERT
  WITH CHECK ( auth.uid() = id );

CREATE POLICY "Users can update own profile."
  ON public.profiles FOR UPDATE
  USING ( auth.uid() = id );

-- 5. RLS POLICIES FOR READING LOGS
-- Anyone can read logs for group tables & charts
CREATE POLICY "Logs are viewable by everyone."
  ON public.reading_logs FOR SELECT
  USING ( true );

-- Logged in users can insert or update ONLY their own logs
CREATE POLICY "Users can insert their own reading logs."
  ON public.reading_logs FOR INSERT
  WITH CHECK ( auth.uid() = user_id );

CREATE POLICY "Users can update their own reading logs."
  ON public.reading_logs FOR UPDATE
  USING ( auth.uid() = user_id );

CREATE POLICY "Users can delete their own reading logs."
  ON public.reading_logs FOR DELETE
  USING ( auth.uid() = user_id );

-- Indexing for fast query performance
CREATE INDEX IF NOT EXISTS idx_reading_logs_date ON public.reading_logs(log_date);
CREATE INDEX IF NOT EXISTS idx_reading_logs_user ON public.reading_logs(user_id);

-- ========================================================
-- 6. GÖREV VE YETKİLENDİRME (AUTH & TASKS) ŞEMASI
-- ========================================================

-- Profiles tablosuna role sütunu ekle (admin / user)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user'));

-- Görevler tablosu
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  difficulty INT NOT NULL DEFAULT 1 CHECK (difficulty BETWEEN 1 AND 5),
  status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'done')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Alt Görevler tablosu
CREATE TABLE IF NOT EXISTS public.subtasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  completed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  completed_by_name TEXT,
  completed_at TIMESTAMP WITH TIME ZONE,
  order_index INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.subtasks 
ADD COLUMN IF NOT EXISTS completed_by_name TEXT;

-- İndeksler
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON public.tasks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_subtasks_task_id ON public.subtasks(task_id);
CREATE INDEX IF NOT EXISTS idx_subtasks_is_completed ON public.subtasks(is_completed);

-- Admin kontrol fonksiyonu
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Otomatik Tamamlanma Tetikleyicisi (Trigger)
CREATE OR REPLACE FUNCTION public.sync_task_status_on_subtask_change()
RETURNS TRIGGER AS $$
DECLARE
  v_task_id UUID;
  v_total INT;
  v_completed INT;
BEGIN
  IF (TG_OP = 'DELETE') THEN
    v_task_id := OLD.task_id;
  ELSE
    v_task_id := NEW.task_id;
  END IF;

  SELECT COUNT(*), COUNT(*) FILTER (WHERE is_completed = true)
  INTO v_total, v_completed
  FROM public.subtasks
  WHERE task_id = v_task_id;

  IF v_total > 0 AND v_total = v_completed THEN
    UPDATE public.tasks
    SET status = 'done', updated_at = timezone('utc'::text, now())
    WHERE id = v_task_id;
  ELSE
    UPDATE public.tasks
    SET status = 'todo', updated_at = timezone('utc'::text, now())
    WHERE id = v_task_id;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_sync_task_status ON public.subtasks;
CREATE TRIGGER trigger_sync_task_status
  AFTER INSERT OR UPDATE OR DELETE ON public.subtasks
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_task_status_on_subtask_change();

-- RLS Güvenlik Politikaları
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subtasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Giris yapmis herkes gorevleri gorebilir" ON public.tasks;
CREATE POLICY "Giris yapmis herkes gorevleri gorebilir"
  ON public.tasks FOR SELECT
  USING ( auth.role() = 'authenticated' );

DROP POLICY IF EXISTS "Sadece adminler gorev ekleyebilir" ON public.tasks;
CREATE POLICY "Sadece adminler gorev ekleyebilir"
  ON public.tasks FOR INSERT
  WITH CHECK ( public.is_admin() );

DROP POLICY IF EXISTS "Sadece adminler gorev guncelleyebilir" ON public.tasks;
CREATE POLICY "Sadece adminler gorev guncelleyebilir"
  ON public.tasks FOR UPDATE
  USING ( public.is_admin() );

DROP POLICY IF EXISTS "Sadece adminler gorev silebilir" ON public.tasks;
CREATE POLICY "Sadece adminler gorev silebilir"
  ON public.tasks FOR DELETE
  USING ( public.is_admin() );

DROP POLICY IF EXISTS "Giris yapmis herkes alt gorevleri gorebilir" ON public.subtasks;
CREATE POLICY "Giris yapmis herkes alt gorevleri gorebilir"
  ON public.subtasks FOR SELECT
  USING ( auth.role() = 'authenticated' );

DROP POLICY IF EXISTS "Sadece adminler alt gorev ekleyebilir" ON public.subtasks;
CREATE POLICY "Sadece adminler alt gorev ekleyebilir"
  ON public.subtasks FOR INSERT
  WITH CHECK ( public.is_admin() );

DROP POLICY IF EXISTS "Adminler ve kullanicilar alt gorev guncelleyebilir" ON public.subtasks;
CREATE POLICY "Adminler ve kullanicilar alt gorev guncelleyebilir"
  ON public.subtasks FOR UPDATE
  USING ( public.is_admin() OR auth.role() = 'authenticated' )
  WITH CHECK ( public.is_admin() OR auth.role() = 'authenticated' );

DROP POLICY IF EXISTS "Sadece adminler alt gorev silebilir" ON public.subtasks;
CREATE POLICY "Sadece adminler alt gorev silebilir"
  ON public.subtasks FOR DELETE
  USING ( public.is_admin() );

-- ========================================================
-- 7. CÜZ & ORTAK HATİM TAKİBİ ŞEMASI
-- ========================================================

-- Hatim Döngüleri Tablosu
CREATE TABLE IF NOT EXISTS public.hatim_rounds (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  round_number INT NOT NULL DEFAULT 1,
  title TEXT NOT NULL DEFAULT 'Hatm-i Şerif',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Cüz Atamaları Tablosu
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

CREATE INDEX IF NOT EXISTS idx_hatim_rounds_status ON public.hatim_rounds(status);
CREATE INDEX IF NOT EXISTS idx_hatim_rounds_round_no ON public.hatim_rounds(round_number);
CREATE INDEX IF NOT EXISTS idx_juz_round_status ON public.juz_assignments(round_id, status);
CREATE INDEX IF NOT EXISTS idx_juz_user_id ON public.juz_assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_juz_number ON public.juz_assignments(juz_number);

-- Hatim Tamamlanma Tetikleyicisi
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

-- RLS Politikaları
ALTER TABLE public.hatim_rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.juz_assignments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Herkes hatimleri gorebilir" ON public.hatim_rounds;
CREATE POLICY "Herkes hatimleri gorebilir"
  ON public.hatim_rounds FOR SELECT
  USING ( true );

DROP POLICY IF EXISTS "Giris yapmis herkes hatim baslatabilir" ON public.hatim_rounds;
CREATE POLICY "Giris yapmis herkes hatim baslatabilir"
  ON public.hatim_rounds FOR INSERT
  WITH CHECK ( auth.role() = 'authenticated' );

DROP POLICY IF EXISTS "Giris yapmis herkes hatim guncelleyebilir" ON public.hatim_rounds;
CREATE POLICY "Giris yapmis herkes hatim guncelleyebilir"
  ON public.hatim_rounds FOR UPDATE
  USING ( auth.role() = 'authenticated' );

DROP POLICY IF EXISTS "Herkes cuz durumlarini gorebilir" ON public.juz_assignments;
CREATE POLICY "Herkes cuz durumlarini gorebilir"
  ON public.juz_assignments FOR SELECT
  USING ( true );

DROP POLICY IF EXISTS "Giris yapmis herkes cuz ekleyebilir" ON public.juz_assignments;
CREATE POLICY "Giris yapmis herkes cuz ekleyebilir"
  ON public.juz_assignments FOR INSERT
  WITH CHECK ( auth.role() = 'authenticated' );

DROP POLICY IF EXISTS "Giris yapmis herkes cuz alabilir ve tamamlayabilir" ON public.juz_assignments;
CREATE POLICY "Giris yapmis herkes cuz alabilir ve tamamlayabilir"
  ON public.juz_assignments FOR UPDATE
  USING ( auth.role() = 'authenticated' )
  WITH CHECK ( auth.role() = 'authenticated' );


