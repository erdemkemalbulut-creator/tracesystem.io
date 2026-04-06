import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import Header from '../components/Header';
import { Zap, Check } from 'lucide-react';

export default function Day21Checkpoint() {
  const navigate = useNavigate();
  const { user, updateProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [daysRecorded, setDaysRecorded] = useState(0);
  const [alignmentCount, setAlignmentCount] = useState(0);
  const [integrityCount, setIntegrityCount] = useState(0);
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

  const handleContinue = async () => {
    if (saving) return;
    setSaving(true);

    await updateProfile({
      day_21_checkpoint_seen: true,
      checkpoint_reflection_day_21: reflection || null,
    });
    navigate('/today');
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

          <Zap size={40} style={{ color: 'var(--color-accent-blue)', marginBottom: '1rem' }} />

          <h1 style={{ marginBottom: '0.5rem' }}>21 days. Almost there.</h1>
          <p className="helper-text" style={{ fontSize: '1rem', marginBottom: '2rem' }}>
            Behavior is no longer situational. You're building something real.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '2rem' }}>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '1.75rem', fontWeight: '600', color: 'var(--color-text-primary)', margin: 0 }}>{daysRecorded}</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', margin: 0 }}>recorded</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '1.75rem', fontWeight: '600', color: 'var(--color-text-primary)', margin: 0 }}>{alignmentCount}</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', margin: 0 }}>aligned</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '1.75rem', fontWeight: '600', color: 'var(--color-text-primary)', margin: 0 }}>{integrityCount}</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', margin: 0 }}>integrity</p>
            </div>
          </div>

          <div style={{ textAlign: 'left', marginBottom: '1.5rem' }}>
            <label className="orientation-prompt" style={{ fontSize: '0.875rem', display: 'block', marginBottom: '0.5rem' }}>
              What does this pattern suggest about how you operate? (optional)
            </label>
            <textarea
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              rows={3}
              placeholder="What seems implied by repetition..."
            />
          </div>

          <button className="primary" onClick={handleContinue} disabled={saving} style={{ width: '100%' }}>
            <Check size={16} style={{ marginRight: '0.5rem' }} />
            Continue to Day {daysRecorded + 1}
          </button>
        </div>
      </div>
    </div>
  );
}
