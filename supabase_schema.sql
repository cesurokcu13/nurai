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
