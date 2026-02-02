import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import Header from '../components/Header';

interface Day30Data {
  seasonNumber: number;
  seasonId: string;
  daysRecorded: number;
  alignmentCount: number;
  integrityCount: number;
  awarenessEntries: string[];
}

export default function Day30Closure() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<Day30Data | null>(null);
  const [reflection, setReflection] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;

      const { data: season } = await supabase
        .from('seasons')
        .select('*')
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
        .not('saved_at', 'is', null)
        .order('recorded_date', { ascending: true });

      const daysRecorded = entries?.length || 0;
      const alignmentCount = entries?.filter(e => e.alignment_done).length || 0;
      const integrityCount = entries?.filter(e => e.integrity_done).length || 0;
      const awarenessEntries = entries?.map(e => e.avoided_today).filter(Boolean) || [];

      setData({
        seasonNumber: season.season_number,
        seasonId: season.id,
        daysRecorded,
        alignmentCount,
        integrityCount,
        awarenessEntries,
      });

      setLoading(false);
    };

    loadData();
  }, [user]);

  const handleCloseSeason = async () => {
    if (!reflection.trim()) {
      setError('Required.');
      return;
    }

    if (!data || saving) return;

    setSaving(true);
    setError('');

    try {
      await supabase
        .from('seasons')
        .update({
          day_30_closure_seen: true,
          is_closed: true,
          end_date: new Date().toISOString(),
          season_closure_reflection: reflection,
        })
        .eq('id', data.seasonId);

      navigate('/season-bridge');
    } catch (err) {
      setError('Failed to save reflection.');
      setSaving(false);
    }
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
        <h1>Season complete.</h1>
        <p className="helper-text" style={{ marginBottom: '1rem' }}>
          Thirty days are now recorded.
        </p>
        <p className="helper-text" style={{ marginBottom: '2rem' }}>
          What you see below is not an evaluation.<br />
          It is the difference between what was intended<br />
          and what actually occurred.
        </p>

        <div className="milestone-section">
          <p className="section-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
            What the evidence shows
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <p style={{ fontSize: '0.95rem', lineHeight: '1.6', color: 'var(--color-text-tertiary)', margin: 0 }}>
              Total recorded days: 30
            </p>
            <p style={{ fontSize: '0.95rem', lineHeight: '1.6', color: 'var(--color-text-tertiary)', margin: 0 }}>
              Alignment recorded: {data.alignmentCount} / 30
            </p>
            <p style={{ fontSize: '0.95rem', lineHeight: '1.6', color: 'var(--color-text-tertiary)', margin: 0 }}>
              Integrity recorded: {data.integrityCount} / 30
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {data.awarenessEntries.length > 0 ? (
              data.awarenessEntries.map((entry, i) => (
                <p key={i} style={{ fontSize: '0.95rem', lineHeight: '1.6', color: 'var(--color-text-tertiary)', margin: 0 }}>
                  {entry}
                </p>
              ))
            ) : (
              <p style={{ fontSize: '0.95rem', lineHeight: '1.6', color: 'var(--color-text-muted)', margin: 0 }}>
                No awareness entries recorded.
              </p>
            )}
          </div>
        </div>

        <div className="milestone-section">
          <label htmlFor="closure-reflection" className="section-label" style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>
            What story did you tell yourself — and what does the evidence support?
          </label>
          <textarea
            id="closure-reflection"
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
          <p className="helper-text" style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>
            Write both, plainly. Do not reconcile them.
          </p>
          {error && (
            <p style={{ fontSize: '0.875rem', color: '#e57373', margin: '0.5rem 0 0 0' }}>
              {error}
            </p>
          )}
        </div>

        <button className="primary" onClick={handleCloseSeason} disabled={saving} style={{ marginTop: '2rem' }}>
          Close season
        </button>

        <p className="helper-text" style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.875rem' }}>
          Trace does not resolve this difference.<br />
          It only makes it visible.
        </p>

        <p className="helper-text" style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
          A new season does not change the system.<br />
          It only changes what you notice.
        </p>
      </div>
      </div>
    </div>
  );
}
