/*
  # Create weekly_reflections table for end-of-week required reflections

  1. New Tables
    - `weekly_reflections`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `season_id` (uuid, references seasons)
      - `week_number` (integer) - Which week (1-4) within the season
      - `start_date` (timestamptz) - Start of the week being reflected on
      - `end_date` (timestamptz) - End of the week being reflected on
      - `answer1_text` (text, required) - "What did this week optimize for?"
      - `answer2_text` (text, required) - "What surprised you?"
      - `answer3_text` (text, required) - "What pattern feels most true?"
      - `completed_at` (timestamptz) - When reflection was completed
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `weekly_reflections` table
    - Add policies for users to manage their own reflections

  3. Constraints
    - Unique constraint on (user_id, season_id, week_number)
    - Week number must be 1-4
*/

-- Create weekly_reflections table
CREATE TABLE IF NOT EXISTS weekly_reflections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  season_id uuid REFERENCES seasons(id) ON DELETE CASCADE NOT NULL,
  week_number integer NOT NULL CHECK (week_number >= 1 AND week_number <= 4),
  start_date timestamptz NOT NULL,
  end_date timestamptz NOT NULL,
  answer1_text text NOT NULL,
  answer2_text text NOT NULL,
  answer3_text text NOT NULL,
  completed_at timestamptz DEFAULT now() NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(user_id, season_id, week_number)
);

-- Enable RLS
ALTER TABLE weekly_reflections ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own weekly reflections"
  ON weekly_reflections FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own weekly reflections"
  ON weekly_reflections FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_weekly_reflections_user_season 
  ON weekly_reflections(user_id, season_id, week_number);
