import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

export default function OnboardingStep2() {
  const { updateProfile, user } = useAuth();
  const navigate = useNavigate();
  const [antiDriftText, setAntiDriftText] = useState('');

  const handleNext = async () => {
    if (!antiDriftText.trim() || !user) return;

    await supabase
      .from('onboarding_data')
      .update({ anti_drift_text: antiDriftText })
      .eq('user_id', user.id);

    await updateProfile({ onboarding_step: 3 });
    navigate('/onboarding/3');
  };

  return (
    <div className="page">
      <div className="onboarding-screen">
        <h1>Now look ahead.</h1>
        <div className="onboarding-prompt">
          <label>
            If nothing changes, what are you most afraid this turns into over time?
          </label>
          <p className="helper-text">Don't overthink it.</p>
          <textarea
            value={antiDriftText}
            onChange={(e) => setAntiDriftText(e.target.value)}
            rows={4}
            placeholder=""
          />
        </div>
        <button
          className="primary"
          onClick={handleNext}
          disabled={!antiDriftText.trim()}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
