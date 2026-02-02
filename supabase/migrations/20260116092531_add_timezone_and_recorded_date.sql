/*
  # Add timezone and recorded_date fields

  1. Changes to profiles table
    - Add `timezone` (text) - User's timezone for date calculations
    - Default to 'America/New_York' (will be set from browser on first use)

  2. Changes to daily_entries table
    - Add `recorded_date` (date) - The user-local calendar date when this entry was recorded
    - This is distinct from created_at and is used for "one entry per day" logic

  3. Important Notes
    - recorded_date stores the user's local date (YYYY-MM-DD format)
    - timezone is used to determine when the next day starts for the user
    - These fields are critical for proper daily locking behavior
*/

-- Add timezone to profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'timezone'
  ) THEN
    ALTER TABLE profiles ADD COLUMN timezone text DEFAULT 'America/New_York' NOT NULL;
  END IF;
END $$;

-- Add recorded_date to daily_entries
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'daily_entries' AND column_name = 'recorded_date'
  ) THEN
    ALTER TABLE daily_entries ADD COLUMN recorded_date date NOT NULL DEFAULT CURRENT_DATE;
  END IF;
END $$;

-- Update unique constraint to use recorded_date instead of day_number
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'daily_entries_user_id_season_id_day_number_key'
  ) THEN
    ALTER TABLE daily_entries DROP CONSTRAINT daily_entries_user_id_season_id_day_number_key;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'unique_user_season_date'
  ) THEN
    ALTER TABLE daily_entries ADD CONSTRAINT unique_user_season_date UNIQUE(user_id, season_id, recorded_date);
  END IF;
END $$;

-- Add index for recorded_date queries
CREATE INDEX IF NOT EXISTS idx_daily_entries_recorded_date 
  ON daily_entries(user_id, recorded_date DESC);
