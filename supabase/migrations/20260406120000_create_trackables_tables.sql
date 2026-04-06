/*
  # Create trackables system

  1. New Tables
    - `user_trackables` - User-defined behavioral habits to track
    - `daily_trackable_entries` - Daily completion records for each trackable

  2. Columns added to daily_entries
    - `ai_question_text` - The AI question shown for this entry
    - `ai_question_answer` - The user's answer to the AI question

  3. Security
    - Enable RLS on both new tables
    - Users can only manage their own trackables and entries
*/

-- User-defined trackable behaviors
CREATE TABLE IF NOT EXISTS user_trackables (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  label text NOT NULL,
  emoji text DEFAULT '✓' NOT NULL,
  active boolean DEFAULT true NOT NULL,
  sort_order integer DEFAULT 0 NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(user_id, label)
);

ALTER TABLE user_trackables ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own trackables"
  ON user_trackables FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own trackables"
  ON user_trackables FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own trackables"
  ON user_trackables FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own trackables"
  ON user_trackables FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Daily completion records for each trackable
CREATE TABLE IF NOT EXISTS daily_trackable_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  trackable_id uuid REFERENCES user_trackables(id) ON DELETE CASCADE NOT NULL,
  completed boolean DEFAULT false NOT NULL,
  recorded_date date NOT NULL DEFAULT CURRENT_DATE,
  season_id uuid REFERENCES seasons(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(trackable_id, recorded_date)
);

ALTER TABLE daily_trackable_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own trackable entries"
  ON daily_trackable_entries FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own trackable entries"
  ON daily_trackable_entries FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own trackable entries"
  ON daily_trackable_entries FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Add AI question columns to daily_entries
ALTER TABLE daily_entries ADD COLUMN IF NOT EXISTS ai_question_text text;
ALTER TABLE daily_entries ADD COLUMN IF NOT EXISTS ai_question_answer text;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_trackables_user
  ON user_trackables(user_id, active, sort_order);

CREATE INDEX IF NOT EXISTS idx_daily_trackable_entries_user_date
  ON daily_trackable_entries(user_id, recorded_date);

CREATE INDEX IF NOT EXISTS idx_daily_trackable_entries_trackable_date
  ON daily_trackable_entries(trackable_id, recorded_date);
