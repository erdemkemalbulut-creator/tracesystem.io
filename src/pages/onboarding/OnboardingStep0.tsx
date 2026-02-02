import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function OnboardingStep0() {
  const { updateProfile, profile } = useAuth();
  const navigate = useNavigate();

  const handleNext = async () => {
    if (profile?.onboarding_step === 0) {
      await updateProfile({ onboarding_step: 1 });
    }
    navigate('/onboarding/1');
  };

  return (
    <div className="page">
      <div className="onboarding-screen">
        <div className="onboarding-body">
          <p>
            Trace does not motivate, reward, or correct you.
          </p>
          <p>
            It records what you avoid, what you honor, and what you justify — day after day — until patterns emerge.
          </p>
          <p>
            This will feel uncomfortable at times.
          </p>
          <p>
            Not because it's difficult, but because it asks you to look honestly at your behavior.
          </p>
        </div>
        <button className="primary" onClick={handleNext}>
          I understand
        </button>
        <p className="acknowledgment-clarifier">
          Nothing you write here is scored, reviewed, or judged.
        </p>
      </div>
    </div>
  );
}
