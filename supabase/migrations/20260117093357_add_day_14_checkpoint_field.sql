/*
  # Add Day 14 Checkpoint Field

  1. Changes to profiles table
    - Add `day_14_checkpoint_seen` (boolean, default false) - tracks if user has seen Day 14 checkpoint

  2. Security
    - Table already has RLS enabled
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'day_14_checkpoint_seen'
  ) THEN
    ALTER TABLE profiles ADD COLUMN day_14_checkpoint_seen boolean DEFAULT false;
  END IF;
END $$;