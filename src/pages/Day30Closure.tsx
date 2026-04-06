import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import Header from '../components/Header';
import { Trophy, ArrowRight } from 'lucide-react';

export default function Day30Closure() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [daysRecorded, setDaysRecorded] = useState(0);
  const [alignmentCount, setAlignmentCount] = useState(0);
  const [integrityCount, setIntegrityCount] = useState(0);
  const [seasonId, setSeasonId] = useState<string | null>(null);
  const [reflection, setReflection] = useState('');
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

      if (!season) { setLoading(false); return; }
      setSeasonId(season.id);

      const { data: entries } = await supabase
        .from('daily_entries')
        .select('alignment_done, integrity_done')
        .eq('user_id', user.id)
        .eq('season_id', season.id)
        .not('saved_at', 'is', null);

      setDaysRecorded(entries?.length || 0);
      setAlignmentCount(entries?.filter(e => e.alignment_done).length || 0);
      setIntegrityCount(entries?.filter(e => e.integrity_done).length || 0);
      setLoading(false);
    };

    loadData();
  }, [user]);

  const handleComplete = async () => {
    if (saving || !seasonId) return;
    setSaving(true);

    await supabase
      .from('seasons')
      .update({
        day_30_closure_seen: true,
        season_close_reflection: reflection || null,
        is_closed: true,
        end_date: new Date().toISOString(),
      })
      .eq('id', seasonId);

    navigate('/season-bridge');
  };

  if (loading) {
    return (
      <div className="page-with-shell reflective-bg">
        <Header variant="system" />
        <div className="page"><p className="meta-text">Loading...</p></div>
      </div>
    );
  }

  return (
    <div className="page-with-shell reflective-bg">
      <Header variant="system" />
      <div className="page">
        <div className="milestone-container" style={{ maxWidth: '480px', textAlign: 'center' }}>

          <Trophy size={48} style={{ color: 'var(--color-accent-blue)', marginBottom: '1rem' }} />

          <h1 style={{ marginBottom: '0.5rem' }}>Season complete.</h1>
          <p className="helper-text" style={{ fontSize: '1rem', marginBottom: '2rem' }}>
            30 entries. You did what most people won't — you showed up consistently.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '2rem' }}>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--color-text-primary)', margin: 0 }}>{daysRecorded}</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', margin: 0 }}>days recorded</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--color-text-primary)', margin: 0 }}>{alignmentCount}</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', margin: 0 }}>aligned</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--color-text-primary)', margin: 0 }}>{integrityCount}</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', margin: 0 }}>integrity</p>
            </div>
          </div>

          <div style={{ textAlign: 'left', marginBottom: '1.5rem' }}>
            <label className="orientation-prompt" style={{ fontSize: '0.875rem', display: 'block', marginBottom: '0.5rem' }}>
              What did this season reveal? (optional)
            </label>
            <textarea
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              rows={3}
              placeholder="What you noticed, what changed, what stayed..."
            />
          </div>

          <button className="primary" onClick={handleComplete} disabled={saving} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            Complete season
            <ArrowRight size={16} />
          </button>

          <p className="helper-text" style={{ marginTop: '1.5rem', fontSize: '0.8125rem' }}>
            Seasons separate time. They do not reset behavior.
          </p>
        </div>
      </div>
    </div>
  );
}
