import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import Header from '../components/Header';

interface Day7Data {
  frictionArea: string;
  avoidanceBaseline: string;
  justificationSnapshot: string;
  daysRecorded: number;
  alignmentCount: number;
  integrityCount: number;
  avoidanceExcerpts: string[];
}

export default function Day7Reflection() {
  const navigate = useNavigate();
  const { user, updateProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<Day7Data | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;

      const { data: onboardingData } = await supabase
        .from('onboarding_data')
        .select('friction_area, avoidance_baseline, justification_snapshot')
        .eq('user_id', user.id)
        .maybeSingle();

      const { data: season } = await supabase
        .from('seasons')
        .select('id')
        .eq('user_id', user.id)
        .eq('is_closed', false)
        .order('start_date', { ascending: false })
        .maybeSingle();

      if (!season) {
        setLoading(false);
        return;
      }

      const { data: entries } = await supabase
        .from('daily_entries')
        .select('alignment_done, integrity_done, avoided_today')
        .eq('user_id', user.id)
        .eq('season_id', season.id)
        .not('saved_at', 'is', null);

      const daysRecorded = entries?.length || 0;
      const alignmentCount = entries?.filter(e => e.alignment_done).length || 0;
      const integrityCount = entries?.filter(e => e.integrity_done).length || 0;

      const allAvoidance = entries?.map(e => e.avoided_today).filter(Boolean) || [];
      const shuffled = [...allAvoidance].sort(() => Math.random() - 0.5);
      const excerpts = shuffled.slice(0, Math.min(5, shuffled.length));

      setData({
        frictionArea: onboardingData?.friction_area || 'Not recorded',
        avoidanceBaseline: onboardingData?.avoidance_baseline || 'Not recorded',
        justificationSnapshot: onboardingData?.justification_snapshot || 'Not recorded',
        daysRecorded,
        alignmentCount,
        integrityCount,
        avoidanceExcerpts: excerpts,
      });

      setLoading(false);
    };

    loadData();
  }, [user]);

  const handleContinue = async () => {
    await updateProfile({ day_7_reflection_seen: true });
    navigate('/today');
  };

  const handleDone = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div className="page-with-shell reflective-bg">
        <Header variant="system" />
        <div className="page">
          <div className="onboarding-screen">
            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="page-with-shell reflective-bg">
      <Header variant="system" />
      <div className="page">
        <div className="milestone-container" style={{ maxWidth: '640px' }}>
        <h1>Checkpoint — Day 7</h1>
        <p className="helper-text" style={{ marginBottom: '1rem' }}>
          Seven days of entries have accumulated.
        </p>
        <p className="helper-text" style={{ marginBottom: '1rem' }}>
          At this point, repetition becomes visible.
        </p>
        <p className="helper-text" style={{ marginBottom: '2rem' }}>
          Trace does not explain what this means.<br />
          It only shows what repeated.
        </p>

        <div className="milestone-section">
          <p className="section-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
            Orientation
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <p style={{ fontSize: '0.95rem', lineHeight: '1.6', color: 'var(--color-text-tertiary)', margin: 0 }}>
              You said the area that feels heaviest is:<br />
              <strong>{data.frictionArea}</strong>
            </p>
            <p style={{ fontSize: '0.95rem', lineHeight: '1.6', color: 'var(--color-text-tertiary)', margin: 0 }}>
              You said you tend to delay:<br />
              "{data.avoidanceBaseline}"
            </p>
            <p style={{ fontSize: '0.95rem', lineHeight: '1.6', color: 'var(--color-text-tertiary)', margin: 0 }}>
              You said you usually justify it by telling yourself:<br />
              "{data.justificationSnapshot}"
            </p>
          </div>
        </div>

        <div className="milestone-section">
          <p className="section-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
            Evidence from the last 7 days
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <p style={{ fontSize: '0.95rem', lineHeight: '1.6', color: 'var(--color-text-tertiary)', margin: 0 }}>
              You recorded {data.daysRecorded} out of 7 days.
            </p>
            <p style={{ fontSize: '0.95rem', lineHeight: '1.6', color: 'var(--color-text-tertiary)', margin: 0 }}>
              You marked {data.alignmentCount} acts of alignment.
            </p>
            <p style={{ fontSize: '0.95rem', lineHeight: '1.6', color: 'var(--color-text-tertiary)', margin: 0 }}>
              You marked {data.integrityCount} acts of integrity.
            </p>
          </div>
          <p className="helper-text" style={{ fontSize: '0.85rem', marginBottom: '1.5rem' }}>
            Counts reflect what was recorded, not what should have happened.
          </p>

          <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {data.avoidanceExcerpts.map((excerpt, i) => (
              <p key={i} style={{ fontSize: '0.95rem', lineHeight: '1.6', color: 'var(--color-text-tertiary)', margin: 0 }}>
                "{excerpt}"
              </p>
            ))}
          </div>
        </div>

        <div style={{ textAlign: 'center', padding: '2rem 0 1rem' }}>
          <p className="helper-text" style={{ fontSize: '0.9rem' }}>
            Repetition does not require intention.
          </p>
        </div>

        <div className="button-group" style={{ marginTop: '2rem' }}>
          <button className="primary" onClick={handleContinue}>
            Continue
          </button>
          <button onClick={handleDone} className="text-button" style={{ textAlign: 'center', padding: '0.5rem' }}>
            I'm done for today
          </button>
        </div>
      </div>
      </div>
    </div>
  );
}
