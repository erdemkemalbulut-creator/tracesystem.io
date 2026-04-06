import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import Header from '../components/Header';
import { Flame, Check } from 'lucide-react';

export default function Day7Reflection() {
  const navigate = useNavigate();
  const { user, updateProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [daysRecorded, setDaysRecorded] = useState(0);
  const [alignmentCount, setAlignmentCount] = useState(0);
  const [integrityCount, setIntegrityCount] = useState(0);

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
    await updateProfile({ day_7_reflection_seen: true });
    navigate('/today');
  };

  if (loading) {
    return (
      <div className="page-with-shell reflective-bg">
        <Header variant="system" />
        <div className="page">
          <p className="meta-text">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-with-shell reflective-bg">
      <Header variant="system" />
      <div className="page">
        <div className="milestone-container" style={{ maxWidth: '480px', textAlign: 'center' }}>

          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
            <Flame size={40} style={{ color: 'var(--color-accent-blue)' }} />
          </div>

          <h1 style={{ marginBottom: '0.5rem' }}>7 days in.</h1>
          <p className="helper-text" style={{ fontSize: '1rem', marginBottom: '2rem' }}>
            You showed up. That's the hardest part.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '2rem' }}>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '1.75rem', fontWeight: '600', color: 'var(--color-text-primary)', margin: 0 }}>{daysRecorded}</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', margin: 0 }}>days recorded</p>
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

          <p className="helper-text" style={{ fontSize: '0.9rem', marginBottom: '2rem' }}>
            Patterns are starting to form. Keep going.
          </p>

          <button className="primary" onClick={handleContinue} style={{ width: '100%' }}>
            <Check size={16} style={{ marginRight: '0.5rem' }} />
            Continue to Day {daysRecorded + 1}
          </button>
        </div>
      </div>
    </div>
  );
}
