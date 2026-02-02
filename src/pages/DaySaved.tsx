import { Link, useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import Header from '../components/Header';

interface OnboardingData {
  friction_area: string;
  avoidance_baseline: string;
  justification_snapshot: string;
  quiet_fear: string | null;
}

interface Day30Data {
  seasonId: string;
  daysRecorded: number;
  alignmentCount: number;
  integrityCount: number;
  onboardingData: OnboardingData;
}

export default function DaySaved() {
  const { day } = useParams<{ day: string }>();
  const dayNumber = parseInt(day || '1', 10);
  const [timeUntilNext, setTimeUntilNext] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  const [showDay30Lock, setShowDay30Lock] = useState(false);
  const [day30Data, setDay30Data] = useState<Day30Data | null>(null);
  const [reflection, setReflection] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const checkDay30Status = async () => {
      if (!user || dayNumber !== 30) return;

      const { data: season } = await supabase
        .from('seasons')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_closed', false)
        .order('start_date', { ascending: false })
        .maybeSingle();

      if (!season) return;

      const { data: todayEntry } = await supabase
        .from('daily_entries')
        .select('*')
        .eq('user_id', user.id)
        .eq('season_id', season.id)
        .eq('day_count', 30)
        .not('saved_at', 'is', null)
        .maybeSingle();

      if (todayEntry) {
        const { data: onboardingData } = await supabase
          .from('onboarding_data')
          .select('friction_area, avoidance_baseline, justification_snapshot, quiet_fear')
          .eq('user_id', user.id)
          .maybeSingle();

        const { data: entries } = await supabase
          .from('daily_entries')
          .select('alignment_done, integrity_done')
          .eq('user_id', user.id)
          .eq('season_id', season.id)
          .not('saved_at', 'is', null);

        const daysRecorded = entries?.length || 0;
        const alignmentCount = entries?.filter(e => e.alignment_done).length || 0;
        const integrityCount = entries?.filter(e => e.integrity_done).length || 0;

        setDay30Data({
          seasonId: season.id,
          daysRecorded,
          alignmentCount,
          integrityCount,
          onboardingData: {
            friction_area: onboardingData?.friction_area || 'Not recorded',
            avoidance_baseline: onboardingData?.avoidance_baseline || 'Not recorded',
            justification_snapshot: onboardingData?.justification_snapshot || 'Not recorded',
            quiet_fear: onboardingData?.quiet_fear || null,
          },
        });
        setShowDay30Lock(true);
      }
    };

    checkDay30Status();
  }, [user, dayNumber]);

  useEffect(() => {
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
  }, []);

  const handleCloseSeason = async () => {
    if (!reflection.trim()) {
      setError('Required.');
      return;
    }

    if (!day30Data || saving) return;

    setSaving(true);
    setError('');

    try {
      await supabase
        .from('seasons')
        .update({
          day_30_closure_seen: true,
          is_closed: true,
          end_date: new Date().toISOString(),
          season_close_reflection: reflection,
        })
        .eq('id', day30Data.seasonId);

      navigate('/season-bridge');
    } catch (err) {
      setError('Failed to save reflection.');
      setSaving(false);
    }
  };

  if (showDay30Lock && day30Data) {
    return (
      <div className="page-with-shell reflective-bg">
        <Header variant="system" />
        <div className="page">
          <div className="completion-container">
          <div className="completion-section">
            <h1>30 days completed.</h1>
            <p className="completion-body">What follows is not an evaluation. It's a comparison.</p>
          </div>

          <div className="completion-section">
            <p className="completion-section-label">At the beginning, you said:</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.75rem' }}>
              <p className="completion-body" style={{ fontSize: '0.9rem', lineHeight: '1.5' }}>
                The area that feels heaviest:<br />
                <span style={{ color: 'var(--color-text-secondary)' }}>"{day30Data.onboardingData.friction_area}"</span>
              </p>
              <p className="completion-body" style={{ fontSize: '0.9rem', lineHeight: '1.5' }}>
                You tend to delay:<br />
                <span style={{ color: 'var(--color-text-secondary)' }}>"{day30Data.onboardingData.avoidance_baseline}"</span>
              </p>
              <p className="completion-body" style={{ fontSize: '0.9rem', lineHeight: '1.5' }}>
                You justify it by telling yourself:<br />
                <span style={{ color: 'var(--color-text-secondary)' }}>"{day30Data.onboardingData.justification_snapshot}"</span>
              </p>
              {day30Data.onboardingData.quiet_fear && (
                <p className="completion-body" style={{ fontSize: '0.9rem', lineHeight: '1.5' }}>
                  You were afraid it would become:<br />
                  <span style={{ color: 'var(--color-text-secondary)' }}>"{day30Data.onboardingData.quiet_fear}"</span>
                </p>
              )}
            </div>
          </div>

          <div className="completion-section">
            <p className="completion-section-label">Over 30 days, the record shows:</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.75rem' }}>
              <p className="completion-body" style={{ fontSize: '0.9rem' }}>
                Days recorded: {day30Data.daysRecorded}
              </p>
              <p className="completion-body" style={{ fontSize: '0.9rem' }}>
                Alignment marked: {day30Data.alignmentCount}
              </p>
              <p className="completion-body" style={{ fontSize: '0.9rem' }}>
                Integrity marked: {day30Data.integrityCount}
              </p>
            </div>
            <p className="completion-tip" style={{ marginTop: '1rem' }}>
              This is the evidence.
            </p>
          </div>

          <div className="completion-section">
            <label htmlFor="day30-reflection" className="completion-section-label" style={{ display: 'block', marginBottom: '0.5rem' }}>
              What story were you telling yourself — and what does the evidence actually show?
            </label>
            <textarea
              id="day30-reflection"
              value={reflection}
              onChange={(e) => {
                setReflection(e.target.value);
                setError('');
              }}
              placeholder=""
              rows={6}
              style={{
                width: '100%',
                padding: '0.75rem',
                fontSize: '0.95rem',
                lineHeight: '1.6',
                border: error ? '1px solid #e57373' : '1px solid var(--color-border)',
                borderRadius: '4px',
                backgroundColor: 'var(--color-bg-tertiary)',
                color: 'var(--color-text-primary)',
                resize: 'vertical',
              }}
            />
            <p className="completion-tip" style={{ marginTop: '0.5rem' }}>
              One paragraph. No fixing. No reframing.
            </p>
            {error && (
              <p style={{ fontSize: '0.875rem', color: '#e57373', margin: '0.5rem 0 0 0' }}>
                {error}
              </p>
            )}
          </div>

          <button
            className="primary completion-primary"
            onClick={handleCloseSeason}
            disabled={saving}
          >
            Close this season
          </button>

          <div className="completion-links">
            <Link to="/" className="text-link">
              Start a new season later
            </Link>
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

        <div className="completion-links">
          <Link to="/settings" className="text-link">
            Settings
          </Link>
        </div>
        </div>
      </div>
    </div>
  );
}
