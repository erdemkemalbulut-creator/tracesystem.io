import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import Header from '../components/Header';

interface Day14Data {
  daysRecorded: number;
  alignmentCount: number;
  integrityCount: number;
  awarenessEntries: string[];
}

export default function Day14Checkpoint() {
  const navigate = useNavigate();
  const { user, updateProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<Day14Data | null>(null);
  const [reflection, setReflection] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;

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
        .not('saved_at', 'is', null)
        .order('recorded_date', { ascending: true })
        .limit(14);

      const daysRecorded = entries?.length || 0;
      const alignmentCount = entries?.filter(e => e.alignment_done).length || 0;
      const integrityCount = entries?.filter(e => e.integrity_done).length || 0;
      const awarenessEntries = entries?.map(e => e.avoided_today).filter(Boolean) || [];

      setData({
        daysRecorded,
        alignmentCount,
        integrityCount,
        awarenessEntries,
      });

      setLoading(false);
    };

    loadData();
  }, [user]);

  const handleContinue = async () => {
    if (!reflection.trim()) {
      setError('Required.');
      return;
    }

    if (saving) return;

    setSaving(true);
    setError('');

    try {
      await updateProfile({
        day_14_checkpoint_seen: true,
        checkpoint_reflection_day_14: reflection
      });
      navigate('/today');
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
        <h1>Checkpoint — Day 14</h1>
        <p className="helper-text" style={{ marginBottom: '1rem' }}>
          Fourteen days of entries have accumulated.
        </p>
        <p className="helper-text" style={{ marginBottom: '1rem' }}>
          At this point, patterns are no longer incidental.
        </p>
        <p className="helper-text" style={{ marginBottom: '2rem' }}>
          Trace does not explain these patterns.<br />
          It only shows what persisted.
        </p>

        <div className="milestone-section">
          <p className="section-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
            Evidence from the last 14 days
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <p style={{ fontSize: '0.95rem', lineHeight: '1.6', color: 'var(--color-text-tertiary)', margin: 0 }}>
              Alignment count: {data.alignmentCount} / 14
            </p>
            <p style={{ fontSize: '0.95rem', lineHeight: '1.6', color: 'var(--color-text-tertiary)', margin: 0 }}>
              Integrity count: {data.integrityCount} / 14
            </p>
          </div>
          <p className="helper-text" style={{ fontSize: '0.85rem' }}>
            This reflects what was recorded, not what was intended.
          </p>
        </div>

        <div className="milestone-section">
          <label htmlFor="checkpoint-reflection" className="section-label" style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>
            What pattern is becoming clear?
          </label>
          <textarea
            id="checkpoint-reflection"
            value={reflection}
            onChange={(e) => {
              setReflection(e.target.value);
              setError('');
            }}
            placeholder=""
            rows={4}
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
            Describe what persists across days. Do not explain why.
          </p>
          {error && (
            <p style={{ fontSize: '0.875rem', color: '#e57373', margin: '0.5rem 0 0 0' }}>
              {error}
            </p>
          )}
        </div>

        <button className="primary" onClick={handleContinue} disabled={saving} style={{ marginTop: '2rem' }}>
          Continue
        </button>

        <p className="helper-text" style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem' }}>
          Patterns form whether they are acknowledged or not.
        </p>
      </div>
      </div>
    </div>
  );
}
