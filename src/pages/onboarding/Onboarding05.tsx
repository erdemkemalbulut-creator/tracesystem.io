import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import StepIndicator from '../../components/StepIndicator';

export default function Onboarding05() {
  const { updateProfile, profile, user } = useAuth();
  const navigate = useNavigate();
  const [quietFear, setQuietFear] = useState('');

  useEffect(() => {
    const loadExisting = async () => {
      if (!user) return;
      const { data } = await supabase
        .from('onboarding_data')
        .select('quiet_fear')
        .eq('user_id', user.id)
        .maybeSingle();

      if (data?.quiet_fear) {
        setQuietFear(data.quiet_fear);
      }
    };
    loadExisting();
  }, [user]);

  const handleNext = async () => {
    if (!quietFear.trim() || !user) return;

    await supabase
      .from('onboarding_data')
      .upsert({
        user_id: user.id,
        quiet_fear: quietFear,
      }, { onConflict: 'user_id' });

    if (profile && profile.onboarding_step < 5) {
      await updateProfile({ onboarding_step: 5 });
    }
    navigate('/onboarding/06');
  };

  return (
    <div className="page">
      <button
        onClick={() => navigate('/onboarding/04')}
        className="back-link"
        style={{ marginBottom: '2rem' }}
      >
        ← Back
      </button>
      <div className="onboarding-screen">
        <StepIndicator current={5} total={7} />
        <div className="onboarding-prompt">
          <label>If nothing changes, what are you most afraid this turns into over time?</label>
          <textarea
            value={quietFear}
            onChange={(e) => setQuietFear(e.target.value)}
            rows={5}
            placeholder=""
          />
          <p className="helper-text">Don't overthink it. One sentence is enough.</p>
        </div>
        <button
          className="primary"
          onClick={handleNext}
          disabled={!quietFear.trim()}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
