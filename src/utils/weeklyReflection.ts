import { supabase } from '../lib/supabase';
import { captureError } from '../lib/sentry';

export async function isWeeklyReflectionDue(userId: string): Promise<boolean> {
  try {
    const { data: season } = await supabase
      .from('seasons')
      .select('id, start_date')
      .eq('user_id', userId)
      .is('end_date', null)
      .maybeSingle();

    if (!season) {
      return false;
    }

    const daysSinceStart = Math.floor(
      (Date.now() - new Date(season.start_date).getTime()) / (1000 * 60 * 60 * 24)
    );
    const currentDay = daysSinceStart + 1;

    if (currentDay < 7) {
      return false;
    }

    const weekNumber = Math.floor((currentDay - 1) / 7) + 1;

    if (weekNumber > 4) {
      return false;
    }

    const isDayForReflection = currentDay % 7 === 0 || currentDay === 7 || currentDay === 14 || currentDay === 21 || currentDay === 28;

    if (!isDayForReflection && currentDay < weekNumber * 7) {
      return false;
    }

    const { data: entries } = await supabase
      .from('daily_entries')
      .select('id')
      .eq('user_id', userId)
      .eq('season_id', season.id)
      .gte('day_number', (weekNumber - 1) * 7 + 1)
      .lte('day_number', weekNumber * 7);

    if (!entries || entries.length === 0) {
      return false;
    }

    const { data: existing } = await supabase
      .from('weekly_reflections')
      .select('id')
      .eq('user_id', userId)
      .eq('season_id', season.id)
      .eq('week_number', weekNumber)
      .maybeSingle();

    return !existing;
  } catch (error) {
    captureError(error, 'isWeeklyReflectionDue');
    return false;
  }
}
