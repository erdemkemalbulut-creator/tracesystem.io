/*
  # Add Day 21 Checkpoint Field

  1. Changes to profiles table
    - Add `day_21_checkpoint_seen` (boolean, default false) - tracks if user has seen Day 21 checkpoint

  2. Security
    - Table already has RLS enabled
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'day_21_checkpoint_seen'
  ) THEN
    ALTER TABLE profiles ADD COLUMN day_21_checkpoint_seen boolean DEFAULT false;
  END IF;
END $$;