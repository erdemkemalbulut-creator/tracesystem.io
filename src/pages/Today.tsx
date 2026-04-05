import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import Header from '../components/Header';
import PageTransition from '../components/PageTransition';
import ProgressRing from '../components/ProgressRing';
import AnimatedCheckbox from '../components/AnimatedCheckbox';
import { SkeletonLine, SkeletonBlock } from '../components/Skeleton';
import Day7Reflection from './Day7Reflection';
import Day14Checkpoint from './Day14Checkpoint';
import Day21Checkpoint from './Day21Checkpoint';
import Day30Closure from './Day30Closure';
import {
  getDayNumber,
  getDailyEntry,
  saveDailyEntry,
  getPhaseForDay,
} from '../utils/storage';
import { SectionIcon } from '../ui/icons';

const PHASE_LABELS = ['Awareness', 'Honesty', 'Integrity', 'Stabilization'] as const;
const PHASE_KEYS = ['awareness', 'honesty', 'integrity', 'stabilization'] as const;

function getPhaseIndex(day: number): number {
  const phase = getPhaseForDay(day);
  return PHASE_KEYS.indexOf(phase as typeof PHASE_KEYS[number]);
}

export default function Today() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [checkingCheckpoints, setCheckingCheckpoints] = useState(true);
  const [shouldShowDay7, setShouldShowDay7] = useState(false);
  const [shouldShowDay14, setShouldShowDay14] = useState(false);
  const [shouldShowDay21, setShouldShowDay21] = useState(false);
  const [shouldShowDay30, setShouldShowDay30] = useState(false);
  const [seasonStartDate, setSeasonStartDate] = useState<string | undefined>();
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'success'>('idle');

  const rawDayNumber = getDayNumber(seasonStartDate);
  const dayNumber = Math.min(rawDayNumber, 30);
  const existingEntry = getDailyEntry(dayNumber);
  const isDaySaved = existingEntry && existingEntry.saved_at;
  const currentPhaseIndex = getPhaseIndex(dayNumber);

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

  // Form completion percentage
  const completionPercent = [
    awarenessText.trim().length > 0,
    alignmentDone,
    integrityDone,
    reflectionText.trim().length > 0,
  ].filter(Boolean).length * 25;

  useEffect(() => {
    const checkCheckpoints = async () => {
      if (!user || !profile?.onboarding_complete) {
        setCheckingCheckpoints(false);
        return;
      }

      const { data: season } = await supabase
        .from('seasons')
        .select('id, start_date, day_30_closure_seen')
        .eq('user_id', user.id)
        .eq('is_closed', false)
        .order('start_date', { ascending: false })
        .maybeSingle();

      if (!season) {
        setCheckingCheckpoints(false);
        return;
      }

      setSeasonStartDate(season.start_date);

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

    setSaveState('saving');

    saveDailyEntry(
      dayNumber,
      awarenessText,
      alignmentDone,
      integrityDone,
      reflectionText
    );

    setTimeout(() => {
      setSaveState('success');
      setTimeout(() => {
        navigate(`/day/${dayNumber}/saved`);
      }, 600);
    }, 400);
  };

  if (checkingCheckpoints) {
    return (
      <div className="page">
        <div className="skeleton-group" style={{ maxWidth: 560, paddingTop: '2rem' }}>
          <SkeletonLine width="120px" height="1.5rem" />
          <SkeletonLine width="80%" />
          <SkeletonBlock height="100px" />
          <SkeletonLine width="60%" />
          <SkeletonBlock height="140px" />
        </div>
      </div>
    );
  }

  if (shouldShowDay30) return <Day30Closure />;
  if (shouldShowDay7) return <Day7Reflection />;
  if (shouldShowDay14) return <Day14Checkpoint />;
  if (shouldShowDay21) return <Day21Checkpoint />;

  if (isDaySaved) {
    return (
      <div className="page-with-shell reflective-bg">
        <Header variant="system" />
        <PageTransition>
        <div className="page">
          <div className="completion-container" style={{ alignItems: 'center', textAlign: 'center' }}>
            <ProgressRing current={dayNumber} total={30} size={100} label="/ 30" />

            <div className="completion-section">
              <h1>Today is complete.</h1>
              <span className="today-phase-name">{PHASE_LABELS[currentPhaseIndex]} phase</span>
            </div>

            {/* Phase bar */}
            <div className="phase-bar">
              {PHASE_KEYS.map((key, i) => (
                <div
                  key={key}
                  className={`phase-bar__segment ${
                    i < currentPhaseIndex ? 'phase-bar__segment--completed' :
                    i === currentPhaseIndex ? 'phase-bar__segment--active' : ''
                  }`}
                />
              ))}
            </div>

            <div className="completion-section">
              <p className="completion-body">The system will open again in:</p>
              <p className="completion-body" style={{ fontSize: '1.75rem', fontWeight: '600', marginTop: '0.5rem', fontFamily: 'monospace', letterSpacing: '0.05em' }}>
                {timeUntilNext}
              </p>
              <p className="completion-tip" style={{ marginTop: '1rem' }}>
                One entry per day. Nothing more is expected.
              </p>
            </div>

            <Link to={`/day/${dayNumber}`}>
              <button className="primary completion-primary">
                Review today's entry
              </button>
            </Link>
          </div>
        </div>
        </PageTransition>
      </div>
    );
  }

  return (
    <div className="page-with-shell reflective-bg">
      <Header variant="system" />
      <PageTransition>
      <div className="page">
        <div className="today-container">

        {/* Progress header */}
        <div className="today-header">
          <ProgressRing current={dayNumber} total={30} />
          <h1>Day {dayNumber}</h1>
          <span className="today-phase-name">{PHASE_LABELS[currentPhaseIndex]} phase</span>

          {/* Phase bar */}
          <div className="phase-bar">
            {PHASE_KEYS.map((key, i) => (
              <div
                key={key}
                className={`phase-bar__segment ${
                  i < currentPhaseIndex ? 'phase-bar__segment--completed' :
                  i === currentPhaseIndex ? 'phase-bar__segment--active' : ''
                }`}
              />
            ))}
          </div>

          <p className="meta-text">This takes under a minute. Accuracy matters more than completion.</p>
          {rawDayNumber > 30 && (
            <p className="season-complete-notice">Season complete. Review in Settings.</p>
          )}
        </div>

        {/* Form completion bar */}
        <div className="completion-bar">
          <div className="completion-bar__fill" style={{ width: `${completionPercent}%` }} />
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
            <AnimatedCheckbox
              checked={alignmentDone}
              onChange={setAlignmentDone}
              label="Done"
            />
          </div>

          <div className="action-item">
            <h3 className="action-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <SectionIcon name="Integrity" />
              <span>One act of integrity</span>
            </h3>
            <p className="action-desc">
              Did you keep one promise you made to yourself, even if no one knows?
            </p>
            <AnimatedCheckbox
              checked={integrityDone}
              onChange={setIntegrityDone}
              label="Done"
            />
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
            className={`primary ${saveState === 'success' ? 'glow-accent' : ''}`}
            onClick={handleSave}
            disabled={!awarenessText.trim() || !reflectionText.trim() || saveState !== 'idle'}
          >
            {saveState === 'idle' && 'Record day'}
            {saveState === 'saving' && 'Saving...'}
            {saveState === 'success' && 'Saved'}
          </button>
          <p className="meta-text" style={{ marginTop: '12px', fontSize: '0.8rem' }}>
            Trace does not evaluate this entry. It only records it.
          </p>
        </div>
      </div>
      </div>
      </PageTransition>
    </div>
  );
}
