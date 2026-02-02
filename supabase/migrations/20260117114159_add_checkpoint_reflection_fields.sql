/*
  # Add Checkpoint Reflection Fields

  1. Changes to profiles table
    - Add `checkpoint_reflection_day_14` (text, nullable) - stores user reflection at Day 14 checkpoint
    - Add `checkpoint_reflection_day_21` (text, nullable) - stores user reflection at Day 21 checkpoint

  2. Security
    - Table already has RLS enabled with existing policies
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'checkpoint_reflection_day_14'
  ) THEN
    ALTER TABLE profiles ADD COLUMN checkpoint_reflection_day_14 text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'checkpoint_reflection_day_21'
  ) THEN
    ALTER TABLE profiles ADD COLUMN checkpoint_reflection_day_21 text;
  END IF;
END $$;
