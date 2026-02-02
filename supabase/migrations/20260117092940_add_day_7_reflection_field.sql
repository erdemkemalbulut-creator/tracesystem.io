/*
  # Add Day 7 Reflection Field

  1. Changes to profiles table
    - Add `day_7_reflection_seen` (boolean, default false) - tracks if user has seen Day 7 reflection

  2. Security
    - Table already has RLS enabled
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'day_7_reflection_seen'
  ) THEN
    ALTER TABLE profiles ADD COLUMN day_7_reflection_seen boolean DEFAULT false;
  END IF;
END $$;