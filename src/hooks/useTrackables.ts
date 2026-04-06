import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export interface Trackable {
  id: string;
  label: string;
  emoji: string;
  active: boolean;
  sort_order: number;
}

export function useTrackables() {
  const { user } = useAuth();
  const [trackables, setTrackables] = useState<Trackable[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTrackables = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('user_trackables')
      .select('id, label, emoji, active, sort_order')
      .eq('user_id', user.id)
      .eq('active', true)
      .order('sort_order', { ascending: true });

    setTrackables(data || []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchTrackables();
  }, [fetchTrackables]);

  const addTrackable = async (label: string, emoji: string = '✓') => {
    if (!user) return;
    const maxOrder = trackables.length > 0
      ? Math.max(...trackables.map(t => t.sort_order))
      : -1;

    const { data, error } = await supabase
      .from('user_trackables')
      .insert({
        user_id: user.id,
        label,
        emoji,
        sort_order: maxOrder + 1,
      })
      .select()
      .single();

    if (!error && data) {
      setTrackables(prev => [...prev, data]);
    }
    return { data, error };
  };

  const updateTrackable = async (id: string, updates: Partial<Pick<Trackable, 'label' | 'emoji' | 'active' | 'sort_order'>>) => {
    if (!user) return;
    const { error } = await supabase
      .from('user_trackables')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id);

    if (!error) {
      if (updates.active === false) {
        setTrackables(prev => prev.filter(t => t.id !== id));
      } else {
        setTrackables(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
      }
    }
    return { error };
  };

  const removeTrackable = async (id: string) => {
    return updateTrackable(id, { active: false });
  };

  return {
    trackables,
    loading,
    addTrackable,
    updateTrackable,
    removeTrackable,
    refetch: fetchTrackables,
  };
}
