/*
  # Create daily_entries table for tracking daily reflections

  1. New Tables
    - `daily_entries`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `season_id` (uuid, references seasons)
      - `day_number` (integer) - Day 1-30 within the season
      - `orientation_text` (text) - What feels most avoided today
      - `alignment_done` (boolean) - Whether alignment action was done
      - `alignment_action_text` (text) - What alignment action was taken
      - `integrity_done` (boolean) - Whether integrity action was done
      - `integrity_action_text` (text) - What integrity action was taken
      - `reflection_text` (text, required) - Daily reflection answer
      - `saved_at` (timestamptz) - When the entry was saved
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `daily_entries` table
    - Add policies for users to manage their own entries

  3. Constraints
    - Unique constraint on (user_id, season_id, day_number)
*/

-- Create daily_entries table
CREATE TABLE IF NOT EXISTS daily_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  season_id uuid REFERENCES seasons(id) ON DELETE CASCADE NOT NULL,
  day_number integer NOT NULL CHECK (day_number >= 1 AND day_number <= 30),
  orientation_text text,
  alignment_done boolean DEFAULT false NOT NULL,
  alignment_action_text text,
  integrity_done boolean DEFAULT false NOT NULL,
  integrity_action_text text,
  reflection_text text NOT NULL,
  saved_at timestamptz DEFAULT now() NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(user_id, season_id, day_number)
);

-- Enable RLS
ALTER TABLE daily_entries ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own daily entries"
  ON daily_entries FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own daily entries"
  ON daily_entries FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own daily entries"
  ON daily_entries FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER set_daily_entries_updated_at
  BEFORE UPDATE ON daily_entries
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_daily_entries_user_season 
  ON daily_entries(user_id, season_id, day_number);
