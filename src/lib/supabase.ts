import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Profile {
  id: string;
  email: string;
  onboarding_step: number;
  onboarding_complete: boolean;
  day_7_reflection_seen: boolean;
  day_14_checkpoint_seen: boolean;
  day_21_checkpoint_seen: boolean;
  checkpoint_reflection_day_14?: string | null;
  checkpoint_reflection_day_21?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Season {
  id: string;
  user_id: string;
  season_number: number;
  start_date: string;
  end_date: string | null;
  is_closed: boolean;
  day_30_closure_seen: boolean;
  season_close_reflection: string | null;
  created_at: string;
}
