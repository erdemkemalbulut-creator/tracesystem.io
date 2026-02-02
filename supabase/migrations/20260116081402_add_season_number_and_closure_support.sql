/*
  # Add season number and closure support

  1. Changes to seasons table
    - Add `season_number` (integer) - Sequential season number for each user
    - Add `closure_reflection_1` (text) - Optional reflection at season end
    - Add `closure_reflection_2` (text) - Optional reflection at season end
    - Add `closure_reflection_3` (text) - Optional reflection at season end
    - Add `next_season_focus` (text) - What to observe in next season
    - Add `is_closed` (boolean) - Whether the season is permanently closed

  2. Changes to daily_entries table
    - Add `checkpoint_viewed` (boolean) - Whether checkpoint was acknowledged

  3. Important Notes
    - season_number is sequential per user (1, 2, 3, etc.)
    - is_closed locks the season when Day 30 is completed
    - checkpoint_viewed tracks if user has seen Days 7, 14, 21 summaries
*/

-- Add columns to seasons table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'seasons' AND column_name = 'season_number'
  ) THEN
    ALTER TABLE seasons ADD COLUMN season_number integer NOT NULL DEFAULT 1;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'seasons' AND column_name = 'closure_reflection_1'
  ) THEN
    ALTER TABLE seasons ADD COLUMN closure_reflection_1 text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'seasons' AND column_name = 'closure_reflection_2'
  ) THEN
    ALTER TABLE seasons ADD COLUMN closure_reflection_2 text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'seasons' AND column_name = 'closure_reflection_3'
  ) THEN
    ALTER TABLE seasons ADD COLUMN closure_reflection_3 text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'seasons' AND column_name = 'next_season_focus'
  ) THEN
    ALTER TABLE seasons ADD COLUMN next_season_focus text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'seasons' AND column_name = 'is_closed'
  ) THEN
    ALTER TABLE seasons ADD COLUMN is_closed boolean DEFAULT false NOT NULL;
  END IF;
END $$;

-- Add checkpoint_viewed to daily_entries
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'daily_entries' AND column_name = 'checkpoint_viewed'
  ) THEN
    ALTER TABLE daily_entries ADD COLUMN checkpoint_viewed boolean DEFAULT false NOT NULL;
  END IF;
END $$;

-- Create unique constraint on season_number per user
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'unique_user_season_number'
  ) THEN
    ALTER TABLE seasons ADD CONSTRAINT unique_user_season_number UNIQUE(user_id, season_number);
  END IF;
END $$;