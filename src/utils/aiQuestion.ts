import { supabase } from '../lib/supabase';
import { getQuestionForDay } from './questions';

/**
 * Gets or generates the daily AI question.
 * - Checks Supabase cache first (already generated today)
 * - Day 1-2: falls back to static question bank
 * - Day 3+: calls the edge function to generate a personalized question
 */
export async function getOrGenerateDailyQuestion(
  userId: string,
  dayNumber: number
): Promise<string> {
  const today = new Date().toISOString().split('T')[0];

  // Check if already generated today
  const { data: cached } = await supabase
    .from('daily_ai_questions')
    .select('question_text')
    .eq('user_id', userId)
    .eq('question_date', today)
    .maybeSingle();

  if (cached) {
    return cached.question_text;
  }

  // For first 2 days, use the static question bank
  if (dayNumber <= 2) {
    return getQuestionForDay(dayNumber);
  }

  // Call edge function for AI question
  try {
    const { data, error } = await supabase.functions.invoke('generate-question');

    if (error) {
      console.error('AI question generation failed:', error);
      return getQuestionForDay(dayNumber);
    }

    return data?.question || getQuestionForDay(dayNumber);
  } catch (err) {
    console.error('AI question generation failed:', err);
    return getQuestionForDay(dayNumber);
  }
}
