import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { getDailyEntry } from '../utils/storage';
import { SectionIcon } from '../ui/icons';
import Header from '../components/Header';

interface EntryData {
  awareness_text: string;
  alignment_done: boolean;
  integrity_done: boolean;
  reflection_text: string;
}

export default function DayView() {
  const { day } = useParams<{ day: string }>();
  const { user } = useAuth();
  const dayNumber = parseInt(day || '1', 10);
  const [entry, setEntry] = useState<EntryData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEntry = async () => {
      // Try localStorage first (fast)
      const localEntry = getDailyEntry(dayNumber);
      if (localEntry) {
        setEntry(localEntry);
        setLoading(false);
        return;
      }

      // Fall back to Supabase
      if (user) {
        const { data: season } = await supabase
          .from('seasons')
          .select('id')
          .eq('user_id', user.id)
          .eq('is_closed', false)
          .order('start_date', { ascending: false })
          .maybeSingle();

        if (season) {
          const { data } = await supabase
            .from('daily_entries')
            .select('orientation_text, alignment_done, integrity_done, reflection_text')
            .eq('user_id', user.id)
            .eq('season_id', season.id)
            .eq('day_number', dayNumber)
            .maybeSingle();

          if (data) {
            setEntry({
              awareness_text: data.orientation_text || '',
              alignment_done: data.alignment_done,
              integrity_done: data.integrity_done,
              reflection_text: data.reflection_text,
            });
            setLoading(false);
            return;
          }
        }

        // Also check closed seasons
        const { data: closedSeasons } = await supabase
          .from('seasons')
          .select('id')
          .eq('user_id', user.id)
          .eq('is_closed', true)
          .order('season_number', { ascending: false });

        if (closedSeasons) {
          for (const s of closedSeasons) {
            const { data } = await supabase
              .from('daily_entries')
              .select('orientation_text, alignment_done, integrity_done, reflection_text')
              .eq('user_id', user.id)
              .eq('season_id', s.id)
              .eq('day_number', dayNumber)
              .maybeSingle();

            if (data) {
              setEntry({
                awareness_text: data.orientation_text || '',
                alignment_done: data.alignment_done,
                integrity_done: data.integrity_done,
                reflection_text: data.reflection_text,
              });
              setLoading(false);
              return;
            }
          }
        }
      }

      setEntry(null);
      setLoading(false);
    };

    loadEntry();
  }, [dayNumber, user]);

  if (loading) {
    return (
      <div className="page-with-shell reflective-bg">
        <Header variant="system" />
        <div className="page">
          <div className="today-container">
            <div className="today-header">
              <h1>Day {dayNumber}</h1>
              <p className="completion-tip">Loading...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="page-with-shell reflective-bg">
        <Header variant="system" />
        <div className="page">
          <div className="today-container">
            <div className="today-header">
              <h1>Day {dayNumber}</h1>
              <p className="completion-tip">This entry is read-only.</p>
            </div>
            <div className="day-locked">
              <p>No entry found for this day.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-with-shell reflective-bg">
      <Header variant="system" />
      <div className="page">
        <div className="today-container day-view-readonly">
          <div className="today-header">
            <h1>Day {dayNumber}</h1>
            <p className="completion-tip">This entry is read-only.</p>
          </div>

          <div className="orientation-section">
            <label className="orientation-prompt" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <SectionIcon name="Awareness" />
              <span>— Awareness —</span>
            </label>
            <p className="readonly-text">{entry.awareness_text}</p>
          </div>

          <div className="action-section">
            <div className="action-item">
              <h3 className="action-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <SectionIcon name="Alignment" />
                <span>— Alignment —</span>
              </h3>
              {entry.alignment_done ? (
                <p className="action-status">Done</p>
              ) : (
                <p className="action-status" style={{ color: 'var(--color-text-muted)' }}></p>
              )}
            </div>

            <div className="action-item">
              <h3 className="action-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <SectionIcon name="Integrity" />
                <span>— Integrity —</span>
              </h3>
              {entry.integrity_done ? (
                <p className="action-status">Done</p>
              ) : (
                <p className="action-status" style={{ color: 'var(--color-text-muted)' }}></p>
              )}
            </div>
          </div>

          <div className="reflection-section">
            <label className="reflection-question" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <SectionIcon name="Reflection" />
              <span>— Reflection —</span>
            </label>
            <p className="readonly-text reflection-readonly">{entry.reflection_text}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
