import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import Header from '../components/Header';

interface BridgeData {
  seasonId: string;
  seasonNumber: number;
  daysRecorded: number;
  alignmentCount: number;
  integrityCount: number;
}

export default function SeasonBridge() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<BridgeData | null>(null);
  const [reflection, setReflection] = useState('');
  const [frictionChoice, setFrictionChoice] = useState<string>('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;

      const { data: season } = await supabase
        .from('seasons')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_closed', true)
        .order('end_date', { ascending: false })
        .maybeSingle();

      if (!season || season.bridge_reflection) {
        navigate('/');
        return;
      }

      const { data: entries } = await supabase
        .from('daily_entries')
        .select('alignment_done, integrity_done')
        .eq('user_id', user.id)
        .eq('season_id', season.id)
        .not('saved_at', 'is', null);

      const daysRecorded = entries?.length || 0;
      const alignmentCount = entries?.filter(e => e.alignment_done).length || 0;
      const integrityCount = entries?.filter(e => e.integrity_done).length || 0;

      setData({
        seasonId: season.id,
        seasonNumber: season.season_number,
        daysRecorded,
        alignmentCount,
        integrityCount,
      });

      setLoading(false);
    };

    loadData();
  }, [user, navigate]);

  const handleBeginNextSeason = async () => {
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
          bridge_reflection: reflection,
          bridge_friction_choice: frictionChoice || null,
        })
        .eq('id', data.seasonId);

      const { error: seasonError } = await supabase
        .from('seasons')
        .insert({
          user_id: user!.id,
          season_number: data.seasonNumber + 1,
          start_date: new Date().toISOString(),
          is_closed: false,
        })
        .select()
        .single();

      if (seasonError) throw seasonError;

      navigate('/today');
    } catch (err) {
      setError('Failed to save and create new season.');
      setSaving(false);
    }
  };

  const handlePause = async () => {
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
          bridge_reflection: reflection,
          bridge_friction_choice: frictionChoice || null,
        })
        .eq('id', data.seasonId);

      navigate('/');
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
          <div className="completion-container">
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
        <div className="completion-container">
        <div className="completion-section">
          <h1>Season {data.seasonNumber} closed.</h1>
          <p className="completion-body">
            Thirty days were recorded.<br />
            This season is complete.
          </p>
          <p className="completion-body">
            What repeated is evidence.<br />
            Trace does not interpret it.<br />
            It preserves it.
          </p>
        </div>

        <div className="completion-section">
          <p className="completion-body">
            A new season does not change what was recorded.<br />
            It only creates a new window of observation.
          </p>
        </div>

        <div className="completion-section">
          <label htmlFor="bridge-reflection" className="completion-section-label" style={{ display: 'block', marginBottom: '0.5rem' }}>
            What do you expect will stay the same if you change nothing?
          </label>
          <textarea
            id="bridge-reflection"
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
          <p className="completion-tip" style={{ marginTop: '0.5rem' }}>
            One sentence is enough.
          </p>
          {error && (
            <p style={{ fontSize: '0.875rem', color: '#e57373', margin: '0.5rem 0 0 0' }}>
              {error}
            </p>
          )}
        </div>

        <div className="completion-section">
          <p className="completion-section-label" style={{ marginBottom: '0.75rem' }}>
            Where do you feel the most friction carrying forward?
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="radio"
                name="friction"
                value="same"
                checked={frictionChoice === 'same'}
                onChange={(e) => setFrictionChoice(e.target.value)}
                style={{ marginRight: '0.5rem' }}
              />
              <span className="completion-body" style={{ fontSize: '0.9rem' }}>The same place as before</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="radio"
                name="friction"
                value="different"
                checked={frictionChoice === 'different'}
                onChange={(e) => setFrictionChoice(e.target.value)}
                style={{ marginRight: '0.5rem' }}
              />
              <span className="completion-body" style={{ fontSize: '0.9rem' }}>A different area</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="radio"
                name="friction"
                value="unsure"
                checked={frictionChoice === 'unsure'}
                onChange={(e) => setFrictionChoice(e.target.value)}
                style={{ marginRight: '0.5rem' }}
              />
              <span className="completion-body" style={{ fontSize: '0.9rem' }}>I'm not sure yet</span>
            </label>
          </div>
        </div>

        <button
          className="primary completion-primary"
          onClick={handleBeginNextSeason}
          disabled={saving}
        >
          Begin Season {data.seasonNumber + 1}
        </button>

        <p className="completion-tip" style={{ marginTop: '1rem', textAlign: 'center' }}>
          Seasons separate time. They do not reset behavior.
        </p>

        <div className="completion-links">
          <button
            onClick={handlePause}
            disabled={saving}
            className="text-link"
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            Pause here
          </button>
        </div>
      </div>
      </div>
    </div>
  );
}
