-- ========================================================
-- RISALE-I NUR OKUMA HALKASI - GÖREV VE YETKİLENDİRME (AUTH & TASKS) ŞEMASI
-- ========================================================

-- 1. PROFILES TABLOSUNA ROL SÜTUNU EKLE
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user'));

-- Belirtilen admin e-postasına ('salihwhitestone2@gmail.com') admin rolünü ata
UPDATE public.profiles
SET role = 'admin'
WHERE id IN (
  SELECT id FROM auth.users WHERE lower(email) = 'salihwhitestone2@gmail.com'
);

-- 2. GÖREVLER (TASKS) TABLOSU
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

-- 3. ALT GÖREVLER (SUBTASKS) TABLOSU
CREATE TABLE IF NOT EXISTS public.subtasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  completed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  order_index INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. İNDEKSLER
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON public.tasks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_subtasks_task_id ON public.subtasks(task_id);
CREATE INDEX IF NOT EXISTS idx_subtasks_is_completed ON public.subtasks(is_completed);

-- 5. ADMIN KONTROL YARDIMCI FONKSİYONU
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- 6. ALT GÖREVLER TAMAMLANDIĞINDA ANA GÖREVİN STATÜSÜNÜ OTOMATİK GÜNCELLEYEN TRİGGER
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

  -- Eğer en az 1 alt görev varsa ve hepsi tamamlandıysa görev 'done' olur; aksi halde 'todo'
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

-- 7. ROW LEVEL SECURITY (RLS) POLİTİKALARI

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subtasks ENABLE ROW LEVEL SECURITY;

-- TASKS POLİTİKALARI
-- Giriş yapmış tüm kullanıcılar görevleri görebilir
DROP POLICY IF EXISTS "Giris yapmis herkes gorevleri gorebilir" ON public.tasks;
CREATE POLICY "Giris yapmis herkes gorevleri gorebilir"
  ON public.tasks FOR SELECT
  USING ( auth.role() = 'authenticated' );

-- Sadece admin görev oluşturabilir
DROP POLICY IF EXISTS "Sadece adminler gorev ekleyebilir" ON public.tasks;
CREATE POLICY "Sadece adminler gorev ekleyebilir"
  ON public.tasks FOR INSERT
  WITH CHECK ( public.is_admin() );

-- Sadece admin görev bilgilerini güncelleyebilir (durum trigger tarafından SECURITY DEFINER ile güncellenir)
DROP POLICY IF EXISTS "Sadece adminler gorev guncelleyebilir" ON public.tasks;
CREATE POLICY "Sadece adminler gorev guncelleyebilir"
  ON public.tasks FOR UPDATE
  USING ( public.is_admin() );

-- Sadece admin görev silebilir
DROP POLICY IF EXISTS "Sadece adminler gorev silebilir" ON public.tasks;
CREATE POLICY "Sadece adminler gorev silebilir"
  ON public.tasks FOR DELETE
  USING ( public.is_admin() );

-- SUBTASKS POLİTİKALARI
-- Giriş yapmış herkes alt görevleri görebilir
DROP POLICY IF EXISTS "Giris yapmis herkes alt gorevleri gorebilir" ON public.subtasks;
CREATE POLICY "Giris yapmis herkes alt gorevleri gorebilir"
  ON public.subtasks FOR SELECT
  USING ( auth.role() = 'authenticated' );

-- Sadece admin alt görev ekleyebilir
DROP POLICY IF EXISTS "Sadece adminler alt gorev ekleyebilir" ON public.subtasks;
CREATE POLICY "Sadece adminler alt gorev ekleyebilir"
  ON public.subtasks FOR INSERT
  WITH CHECK ( public.is_admin() );

-- Admin her şeyi güncelleyebilir; normal kullanıcılar ise görev tamamlama durumunu güncelleyebilir
DROP POLICY IF EXISTS "Adminler ve kullanicilar alt gorev guncelleyebilir" ON public.subtasks;
CREATE POLICY "Adminler ve kullanicilar alt gorev guncelleyebilir"
  ON public.subtasks FOR UPDATE
  USING (
    public.is_admin() OR auth.role() = 'authenticated'
  )
  WITH CHECK (
    public.is_admin() OR auth.role() = 'authenticated'
  );

-- Sadece admin alt görev silebilir
DROP POLICY IF EXISTS "Sadece adminler alt gorev silebilir" ON public.subtasks;
CREATE POLICY "Sadece adminler alt gorev silebilir"
  ON public.subtasks FOR DELETE
  USING ( public.is_admin() );
