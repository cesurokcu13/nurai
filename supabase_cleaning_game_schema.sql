-- Shared leaderboard and one-time task completion records for the cleaning game.
-- Apply this file in the Supabase SQL editor before enabling the shared game board.

CREATE TABLE IF NOT EXISTS public.cleaning_game_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  task_key TEXT NOT NULL,
  nickname TEXT NOT NULL,
  character_index SMALLINT NOT NULL DEFAULT 0 CHECK (character_index BETWEEN 0 AND 9),
  completed_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT cleaning_game_user_task_unique UNIQUE (user_id, task_key)
);

CREATE INDEX IF NOT EXISTS idx_cleaning_game_user_id
  ON public.cleaning_game_completions(user_id);

-- Expose only the operations the game needs through the Supabase Data API.
REVOKE ALL ON TABLE public.cleaning_game_completions FROM anon;
GRANT SELECT, INSERT ON TABLE public.cleaning_game_completions TO authenticated;

ALTER TABLE public.cleaning_game_completions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Signed-in users can view cleaning game scores"
  ON public.cleaning_game_completions;
CREATE POLICY "Signed-in users can view cleaning game scores"
  ON public.cleaning_game_completions FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Users can save their own cleaning game scores"
  ON public.cleaning_game_completions;
CREATE POLICY "Users can save their own cleaning game scores"
  ON public.cleaning_game_completions FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);
