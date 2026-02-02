import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

export default function OnboardingStep1() {
  const { updateProfile, user } = useAuth();
  const navigate = useNavigate();
  const [avoidanceText, setAvoidanceText] = useState('');

  const handleNext = async () => {
    if (!avoidanceText.trim() || !user) return;

    await supabase
      .from('onboarding_data')
      .upsert({
        user_id: user.id,
        avoidance_text: avoidanceText,
      }, { onConflict: 'user_id' });

    await updateProfile({ onboarding_step: 2 });
    navigate('/onboarding/2');
  };

  return (
    <div className="page">
      <div className="onboarding-screen">
        <h1>Let's start simply.</h1>
        <div className="onboarding-prompt">
          <label>
            What is something in your life you know you're avoiding — but haven't
            admitted out loud?
          </label>
          <p className="helper-text">One sentence is enough. This stays private.</p>
          <textarea
            value={avoidanceText}
            onChange={(e) => setAvoidanceText(e.target.value)}
            rows={4}
            placeholder=""
          />
        </div>
        <button
          className="primary"
          onClick={handleNext}
          disabled={!avoidanceText.trim()}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
