/*
  # Create onboarding_data and seasons tables

  1. New Tables
    - `onboarding_data`
      - `user_id` (uuid, primary key, references profiles)
      - `avoidance_text` (text) - User's answer to avoidance question
      - `anti_drift_text` (text) - User's answer to anti-drift question
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `seasons`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `start_date` (timestamptz) - When the 30-day season started
      - `end_date` (timestamptz) - When the season ended (null if active)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for users to manage their own data
*/

-- Create onboarding_data table
CREATE TABLE IF NOT EXISTS onboarding_data (
  user_id uuid PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  avoidance_text text,
  anti_drift_text text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE onboarding_data ENABLE ROW LEVEL SECURITY;

-- Policies for onboarding_data
CREATE POLICY "Users can view own onboarding data"
  ON onboarding_data FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own onboarding data"
  ON onboarding_data FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own onboarding data"
  ON onboarding_data FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create seasons table
CREATE TABLE IF NOT EXISTS seasons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  start_date timestamptz DEFAULT now() NOT NULL,
  end_date timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE seasons ENABLE ROW LEVEL SECURITY;

-- Policies for seasons
CREATE POLICY "Users can view own seasons"
  ON seasons FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own seasons"
  ON seasons FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own seasons"
  ON seasons FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Trigger for onboarding_data updated_at
CREATE TRIGGER set_onboarding_data_updated_at
  BEFORE UPDATE ON onboarding_data
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();
