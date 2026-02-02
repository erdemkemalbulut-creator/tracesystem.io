import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

export default function Onboarding06() {
  const { updateProfile, profile, user } = useAuth();
  const navigate = useNavigate();

  const handleConsent = async (consent: boolean) => {
    if (!user) return;

    await supabase
      .from('onboarding_data')
      .upsert({
        user_id: user.id,
        consent: consent,
      }, { onConflict: 'user_id' });

    if (!consent) {
      navigate('/');
      return;
    }

    if (profile && profile.onboarding_step < 6) {
      await updateProfile({ onboarding_step: 6 });
    }
    navigate('/onboarding/07');
  };

  return (
    <div className="page">
      <button
        onClick={() => navigate('/onboarding/05')}
        className="back-link"
        style={{ marginBottom: '2rem' }}
      >
        ← Back
      </button>
      <div className="onboarding-screen">
        <div className="onboarding-prompt">
          <label>
            For the next 30 days, are you willing to observe your actions — even when it's uncomfortable — without trying to fix them?
          </label>
        </div>
        <div className="button-group">
          <button className="primary" onClick={() => handleConsent(true)}>
            Yes
          </button>
          <button onClick={() => handleConsent(false)}>
            Not right now
          </button>
        </div>
      </div>
    </div>
  );
}
