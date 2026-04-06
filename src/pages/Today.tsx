import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import Header from '../components/Header';
import PageTransition from '../components/PageTransition';
import ProgressRing from '../components/ProgressRing';
import TrackableToggle from '../components/TrackableToggle';
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
import { getQuestionForDay } from '../utils/questions';
import { getOrGenerateDailyQuestion } from '../utils/aiQuestion';
import { useTrackables } from '../hooks/useTrackables';
import { ChevronDown, ChevronUp } from 'lucide-react';

const PHASE_LABELS = ['Awareness', 'Honesty', 'Integrity', 'Stabilization'] as const;
const PHASE_KEYS = ['awareness', 'honesty', 'integrity', 'stabilization'] as const;

function getPhaseIndex(day: number): number {
  const phase = getPhaseForDay(day);
  return PHASE_KEYS.indexOf(phase as typeof PHASE_KEYS[number]);
}

export default function Today() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { trackables, loading: trackablesLoading } = useTrackables();

  const [checkingCheckpoints, setCheckingCheckpoints] = useState(true);
  const [shouldShowDay7, setShouldShowDay7] = useState(false);
  const [shouldShowDay14, setShouldShowDay14] = useState(false);
  const [shouldShowDay21, setShouldShowDay21] = useState(false);
  const [shouldShowDay30, setShouldShowDay30] = useState(false);
  const [seasonStartDate, setSeasonStartDate] = useState<string | undefined>();
  const [seasonId, setSeasonId] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'success'>('idle');

  const dayNumber = getDayNumber(seasonStartDate);
  const existingEntry = getDailyEntry(dayNumber);
  const isDaySaved = existingEntry && existingEntry.saved_at;
  const currentPhaseIndex = getPhaseIndex(dayNumber);

  // Today's question — AI-powered (falls back to static bank)
  const [todayQuestion, setTodayQuestion] = useState(getQuestionForDay(dayNumber));
  const [questionLoading, setQuestionLoading] = useState(false);

  // Form state
  const [trackableStates, setTrackableStates] = useState<Record<string, boolean>>({});
  const [questionAnswer, setQuestionAnswer] = useState('');
  const [showReflection, setShowReflection] = useState(false);
  const [reflectionText, setReflectionText] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [timeUntilNext, setTimeUntilNext] = useState('');

  // Completion: trackables count + question answer + optional reflection
  const trackablesDone = Object.values(trackableStates).filter(Boolean).length;
  const totalTrackables = trackables.length;
  const hasAnswer = questionAnswer.trim().length > 0;
  const completionSteps = totalTrackables > 0
    ? [trackablesDone > 0, hasAnswer]
    : [hasAnswer];
  const completionPercent = Math.round(
    (completionSteps.filter(Boolean).length / completionSteps.length) * 100
  );

  // Load existing entry data
  useEffect(() => {
    if (existingEntry) {
      setQuestionAnswer(existingEntry.awareness_text || '');
      setReflectionText(existingEntry.reflection_text || '');
    }
  }, [dayNumber]);

  // Load AI question
  useEffect(() => {
    if (!user || !seasonId || isDaySaved) return;
    setQuestionLoading(true);
    getOrGenerateDailyQuestion(user.id, dayNumber)
      .then(q => setTodayQuestion(q))
      .finally(() => setQuestionLoading(false));
  }, [user, seasonId, dayNumber, isDaySaved]);

  // Check checkpoints
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
      setSeasonId(season.id);

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

  // Countdown timer when day is saved
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

  const handleToggleTrackable = (id: string, checked: boolean) => {
    setTrackableStates(prev => ({ ...prev, [id]: checked }));
  };

  const handleSave = async () => {
    setErrorMessage('');

    if (!questionAnswer.trim()) {
      setErrorMessage('Please answer today\'s question.');
      return;
    }

    setSaveState('saving');

    // Save to localStorage (backward compat: awareness_text = question answer)
    saveDailyEntry(
      dayNumber,
      questionAnswer,
      trackablesDone > 0, // alignment_done = at least one trackable done
      trackablesDone === totalTrackables && totalTrackables > 0, // integrity_done = all trackables done
      reflectionText
    );

    // Sync to Supabase
    if (user && seasonId) {
      try {
        await supabase.from('daily_entries').upsert(
          {
            user_id: user.id,
            season_id: seasonId,
            day_number: dayNumber,
            orientation_text: questionAnswer,
            alignment_done: trackablesDone > 0,
            integrity_done: trackablesDone === totalTrackables && totalTrackables > 0,
            reflection_text: reflectionText || '',
            ai_question_text: todayQuestion,
            ai_question_answer: questionAnswer,
            recorded_date: new Date().toISOString().split('T')[0],
            saved_at: new Date().toISOString(),
          },
          { onConflict: 'user_id,season_id,day_number' }
        );

        // Save trackable entries
        const trackableEntries = trackables.map(t => ({
          user_id: user.id,
          trackable_id: t.id,
          completed: trackableStates[t.id] || false,
          recorded_date: new Date().toISOString().split('T')[0],
          season_id: seasonId,
        }));

        if (trackableEntries.length > 0) {
          await supabase.from('daily_trackable_entries').upsert(
            trackableEntries,
            { onConflict: 'trackable_id,recorded_date' }
          );
        }
      } catch (err) {
        console.error('Supabase sync failed:', err);
      }
    }

    setSaveState('success');
    setTimeout(() => {
      navigate(`/day/${dayNumber}/saved`);
    }, 600);
  };

  // Loading states
  if (checkingCheckpoints || trackablesLoading) {
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

  // Checkpoint screens
  if (shouldShowDay30) return <Day30Closure />;
  if (shouldShowDay7) return <Day7Reflection />;
  if (shouldShowDay14) return <Day14Checkpoint />;
  if (shouldShowDay21) return <Day21Checkpoint />;

  // Day already saved
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

  // Main check-in form
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

          <p className="meta-text">Quick check-in. Under 30 seconds.</p>
          {dayNumber >= 30 && existingEntry && (
            <p className="season-complete-notice">Season complete. Review in Settings.</p>
          )}
        </div>

        {/* Completion bar */}
        <div className="completion-bar">
          <div className="completion-bar__fill" style={{ width: `${completionPercent}%` }} />
        </div>

        {/* Trackable toggles */}
        {trackables.length > 0 && (
          <div className="orientation-section">
            <label className="orientation-prompt">
              How did you show up today?
            </label>
            <div className="trackables-grid">
              {trackables.map(t => (
                <TrackableToggle
                  key={t.id}
                  emoji={t.emoji}
                  label={t.label}
                  checked={trackableStates[t.id] || false}
                  onChange={(checked) => handleToggleTrackable(t.id, checked)}
                />
              ))}
            </div>
            <Link to="/trackables" className="manage-trackables-link">
              + Manage behaviors
            </Link>
          </div>
        )}

        {trackables.length === 0 && (
          <div className="orientation-section">
            <label className="orientation-prompt">
              Start by adding behaviors to track
            </label>
            <p className="orientation-helper">
              Define what matters to you — things like "Had the hard conversation" or "Kept my morning routine."
            </p>
            <Link to="/trackables" className="primary" style={{ textAlign: 'center', textDecoration: 'none' }}>
              + Add your first behavior
            </Link>
          </div>
        )}

        {/* Today's question */}
        <div className="ai-question-section">
          <label className="ai-question-prompt">
            {questionLoading ? (
              <SkeletonLine width="80%" height="1.2rem" />
            ) : (
              todayQuestion
            )}
          </label>
          <textarea
            value={questionAnswer}
            onChange={(e) => setQuestionAnswer(e.target.value)}
            rows={3}
            placeholder="Be honest. One sentence is enough."
          />
        </div>

        {/* Optional deeper reflection */}
        <div>
          <button
            type="button"
            className="reflection-expander"
            onClick={() => setShowReflection(!showReflection)}
          >
            {showReflection ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            {showReflection ? 'Hide deeper reflection' : 'Add deeper reflection'}
          </button>

          {showReflection && (
            <div className="reflection-section" style={{ marginTop: '0.75rem' }}>
              <label className="reflection-question">
                What actually happened today?
              </label>
              <p className="reflection-helper">
                Record what is true. Do not explain or justify.
              </p>
              <textarea
                value={reflectionText}
                onChange={(e) => setReflectionText(e.target.value)}
                rows={5}
                placeholder="I noticed the same hesitation and chose not to act."
              />
            </div>
          )}
        </div>

        {/* Save */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {errorMessage && <p className="error-message">{errorMessage}</p>}
          <button
            className={`primary ${saveState === 'success' ? 'glow-accent' : ''}`}
            onClick={handleSave}
            disabled={!questionAnswer.trim() || saveState !== 'idle'}
          >
            {saveState === 'idle' && 'Save check-in'}
            {saveState === 'saving' && 'Saving...'}
            {saveState === 'success' && 'Saved'}
          </button>
          <p className="meta-text" style={{ fontSize: '0.8rem', textAlign: 'center' }}>
            Trace records. It does not judge.
          </p>
        </div>

        </div>
      </div>
      </PageTransition>
    </div>
  );
}
