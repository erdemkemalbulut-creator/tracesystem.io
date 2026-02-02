import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

export default function Onboarding03() {
  const { updateProfile, profile, user } = useAuth();
  const navigate = useNavigate();
  const [avoidanceBaseline, setAvoidanceBaseline] = useState('');

  useEffect(() => {
    const loadExisting = async () => {
      if (!user) return;
      const { data } = await supabase
        .from('onboarding_data')
        .select('avoidance_baseline')
        .eq('user_id', user.id)
        .maybeSingle();

      if (data?.avoidance_baseline) {
        setAvoidanceBaseline(data.avoidance_baseline);
      }
    };
    loadExisting();
  }, [user]);

  const handleNext = async () => {
    if (!avoidanceBaseline.trim() || !user) return;

    await supabase
      .from('onboarding_data')
      .upsert({
        user_id: user.id,
        avoidance_baseline: avoidanceBaseline,
      }, { onConflict: 'user_id' });

    if (profile && profile.onboarding_step < 3) {
      await updateProfile({ onboarding_step: 3 });
    }
    navigate('/onboarding/04');
  };

  return (
    <div className="page">
      <button
        onClick={() => navigate('/onboarding/02')}
        className="back-link"
        style={{ marginBottom: '2rem' }}
      >
        ← Back
      </button>
      <div className="onboarding-screen">
        <div className="onboarding-prompt">
          <label>What do you tend to delay, even when you know it matters?</label>
          <textarea
            value={avoidanceBaseline}
            onChange={(e) => setAvoidanceBaseline(e.target.value)}
            rows={5}
            placeholder=""
          />
          <p className="helper-text">Precision matters more than eloquence.</p>
        </div>
        <button
          className="primary"
          onClick={handleNext}
          disabled={!avoidanceBaseline.trim()}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
