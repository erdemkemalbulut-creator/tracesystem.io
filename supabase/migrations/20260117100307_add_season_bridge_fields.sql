/*
  # Add Season Bridge Fields

  1. Changes to seasons table
    - Add `bridge_reflection` (text) - Required reflection about what will stay the same
    - Add `bridge_friction_choice` (text) - Optional choice about where friction is

  2. Important Notes
    - bridge_reflection is required before starting a new season
    - bridge_friction_choice can be: 'same', 'different', 'unsure', or null
    - These fields are set after Day 30 closure and before new season begins

  3. Security
    - Table already has RLS enabled
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'seasons' AND column_name = 'bridge_reflection'
  ) THEN
    ALTER TABLE seasons ADD COLUMN bridge_reflection text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'seasons' AND column_name = 'bridge_friction_choice'
  ) THEN
    ALTER TABLE seasons ADD COLUMN bridge_friction_choice text;
  END IF;
END $$;