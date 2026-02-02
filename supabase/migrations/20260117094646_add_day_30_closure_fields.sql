/*
  # Add Day 30 Closure Fields

  1. Changes to seasons table
    - Add `day_30_closure_seen` (boolean, default false) - tracks if user has seen Day 30 closure
    - Add `season_close_reflection` (text) - required reflection at Day 30 closure

  2. Security
    - Table already has RLS enabled
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'seasons' AND column_name = 'day_30_closure_seen'
  ) THEN
    ALTER TABLE seasons ADD COLUMN day_30_closure_seen boolean DEFAULT false NOT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'seasons' AND column_name = 'season_close_reflection'
  ) THEN
    ALTER TABLE seasons ADD COLUMN season_close_reflection text;
  END IF;
END $$;