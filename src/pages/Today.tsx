import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import Header from '../components/Header';
import Day7Reflection from './Day7Reflection';
import Day14Checkpoint from './Day14Checkpoint';
import Day21Checkpoint from './Day21Checkpoint';
import Day30Closure from './Day30Closure';
import {
  getDayNumber,
  getDailyEntry,
  saveDailyEntry,
} from '../utils/storage';
import { SectionIcon } from '../ui/icons';

export default function Today() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [checkingCheckpoints, setCheckingCheckpoints] = useState(true);
  const [shouldShowDay7, setShouldShowDay7] = useState(false);
  const [shouldShowDay14, setShouldShowDay14] = useState(false);
  const [shouldShowDay21, setShouldShowDay21] = useState(false);
  const [shouldShowDay30, setShouldShowDay30] = useState(false);

  const rawDayNumber = getDayNumber();
  const dayNumber = Math.min(rawDayNumber, 30);
  const existingEntry = getDailyEntry(dayNumber);
  const isDaySaved = existingEntry && existingEntry.saved_at;

  const [awarenessText, setAwarenessText] = useState(
    existingEntry?.awareness_text || ''
  );
  const [alignmentDone, setAlignmentDone] = useState(
    existingEntry?.alignment_done || false
  );
  const [integrityDone, setIntegrityDone] = useState(
    existingEntry?.integrity_done || false
  );
  const [reflectionText, setReflectionText] = useState(
    existingEntry?.reflection_text || ''
  );
  const [errorMessage, setErrorMessage] = useState('');
  const [timeUntilNext, setTimeUntilNext] = useState('');

  useEffect(() => {
    const checkCheckpoints = async () => {
      if (!user || !profile?.onboarding_complete) {
        setCheckingCheckpoints(false);
        return;
      }

      const { data: season } = await supabase
        .from('seasons')
        .select('id, day_30_closure_seen')
        .eq('user_id', user.id)
        .eq('is_closed', false)
        .order('start_date', { ascending: false })
        .maybeSingle();

      if (!season) {
        setCheckingCheckpoints(false);
        return;
      }

      const { data: entries } = await supabase
        .from('daily_entries')
        .select('id')
        .eq('user_id', user.id)
        .eq('season_id', season.id)
        .not('saved_at', 'is', null);

      const completedDays = entries?.length || 0;

      if (!season.day_30_closure_seen && completedDays >= 30) {
        setShouldShowDay30(true);
      } else if (!profile?.day_7_reflection_seen && completedDays >= 7) {
        setShouldShowDay7(true);
      } else if (!profile?.day_14_checkpoint_seen && completedDays >= 14) {
        setShouldShowDay14(true);
      } else if (!profile?.day_21_checkpoint_seen && completedDays >= 21) {
        setShouldShowDay21(true);
      }

      setCheckingCheckpoints(false);
    };

    checkCheckpoints();
  }, [user, profile]);

  useEffect(() => {
    const entry = getDailyEntry(dayNumber);
    if (entry) {
      setAwarenessText(entry.awareness_text || '');
      setAlignmentDone(entry.alignment_done);
      setIntegrityDone(entry.integrity_done);
      setReflectionText(entry.reflection_text || '');
    }
  }, [dayNumber]);

  useEffect(() => {
    if (!isDaySaved) return;

    const updateCountdown = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setHours(24, 0, 0, 0);
      const diff = tomorrow.getTime() - now.getTime();

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeUntilNext(
        `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
      );
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [isDaySaved]);

  const handleSave = () => {
    setErrorMessage('');

    if (!awarenessText.trim()) {
      setErrorMessage('Awareness field is required.');
      return;
    }

    if (!reflectionText.trim()) {
      setErrorMessage('Reflection field is required.');
      return;
    }

    saveDailyEntry(
      dayNumber,
      awarenessText,
      alignmentDone,
      integrityDone,
      reflectionText
    );

    navigate(`/day/${dayNumber}/saved`);
  };

  if (checkingCheckpoints) {
    return (
      <div className="page">
        <div className="onboarding-screen">
          <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (shouldShowDay30) {
    return <Day30Closure />;
  }

  if (shouldShowDay7) {
    return <Day7Reflection />;
  }

  if (shouldShowDay14) {
    return <Day14Checkpoint />;
  }

  if (shouldShowDay21) {
    return <Day21Checkpoint />;
  }

  if (isDaySaved) {
    return (
      <div className="page-with-shell reflective-bg">
        <Header variant="system" />
        <div className="page">
          <div className="completion-container">
            <div className="completion-section">
              <h1>Today is complete.</h1>
            </div>

            <div className="completion-section">
              <p className="completion-body">The system will open again in:</p>
              <p className="completion-body" style={{ fontSize: '1.5rem', fontWeight: '500', marginTop: '0.5rem' }}>
                {timeUntilNext}
              </p>
              <p className="completion-tip" style={{ marginTop: '1rem' }}>
                One entry per day. Nothing more is expected.
              </p>
            </div>

            <div className="completion-section">
              <p className="completion-tip">Trace records time, not effort.</p>
            </div>

            <Link to={`/day/${dayNumber}`}>
              <button className="primary completion-primary">
                Review today's entry
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-with-shell reflective-bg">
      <Header variant="system" />
      <div className="page">
        <div className="today-container">
        <div className="today-header">
          <h1>Day {dayNumber}</h1>
          <p className="meta-text">This takes under a minute. Accuracy matters more than completion.</p>
          {rawDayNumber > 30 && (
            <p className="season-complete-notice">Season complete. Review in Settings.</p>
          )}
        </div>

        <div className="orientation-section">
          <label className="orientation-prompt" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <SectionIcon name="Awareness" />
            <span>What did you avoid today that you knew mattered?</span>
          </label>
          <p className="orientation-helper">
            Be literal. One sentence is enough.
          </p>
          <textarea
            value={awarenessText}
            onChange={(e) => setAwarenessText(e.target.value)}
            rows={3}
            placeholder="I avoided sending the message I knew would be uncomfortable."
          />
        </div>

        <div className="action-section">
          <div className="action-item">
            <h3 className="action-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <SectionIcon name="Alignment" />
              <span>One act of alignment</span>
            </h3>
            <p className="action-desc">
              Did you do one thing that directly confronted what you avoided?
            </p>
            <label className="checkbox-container">
              <input
                type="checkbox"
                checked={alignmentDone}
                onChange={(e) => setAlignmentDone(e.target.checked)}
              />
              <span>Done</span>
            </label>
          </div>

          <div className="action-item">
            <h3 className="action-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <SectionIcon name="Integrity" />
              <span>One act of integrity</span>
            </h3>
            <p className="action-desc">
              Did you keep one promise you made to yourself, even if no one knows?
            </p>
            <label className="checkbox-container">
              <input
                type="checkbox"
                checked={integrityDone}
                onChange={(e) => setIntegrityDone(e.target.checked)}
              />
              <span>Done</span>
            </label>
          </div>
        </div>

        <div className="reflection-section">
          <label className="reflection-question" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <SectionIcon name="Reflection" />
            <span>What actually happened today?</span>
          </label>
          <p className="reflection-helper">
            Record what is true. Do not explain or justify.
          </p>
          <textarea
            value={reflectionText}
            onChange={(e) => setReflectionText(e.target.value)}
            rows={6}
            placeholder="I noticed the same hesitation and chose not to act."
          />
          {errorMessage && <p className="error-message">{errorMessage}</p>}
          <button
            className="primary"
            onClick={handleSave}
            disabled={!awarenessText.trim() || !reflectionText.trim()}
          >
            Record day
          </button>
          <p className="meta-text" style={{ marginTop: '12px', fontSize: '0.8rem' }}>
            Trace does not evaluate this entry. It only records it.
          </p>
        </div>
      </div>
      </div>
    </div>
  );
}
