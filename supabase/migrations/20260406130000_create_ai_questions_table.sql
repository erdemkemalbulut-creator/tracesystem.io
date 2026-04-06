/*
  # Create daily AI questions table

  Stores AI-generated personalized questions so they are not
  regenerated on page refresh.

  1. New Table
    - `daily_ai_questions` - one question per user per day

  2. Security
    - RLS enabled, users can only access their own questions
*/

CREATE TABLE IF NOT EXISTS daily_ai_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  question_text text NOT NULL,
  question_date date NOT NULL DEFAULT CURRENT_DATE,
  model text DEFAULT 'gpt-4o-mini',
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(user_id, question_date)
);

ALTER TABLE daily_ai_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own ai questions"
  ON daily_ai_questions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own ai questions"
  ON daily_ai_questions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_daily_ai_questions_user_date
  ON daily_ai_questions(user_id, question_date);
