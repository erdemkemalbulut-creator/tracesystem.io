import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function Onboarding01() {
  const { updateProfile, profile } = useAuth();
  const navigate = useNavigate();

  const handleNext = async () => {
    if (profile && profile.onboarding_step < 1) {
      await updateProfile({ onboarding_step: 1 });
    }
    navigate('/onboarding/02');
  };

  return (
    <div className="page">
      <div className="onboarding-screen">
        <h1>Before you begin</h1>
        <div className="onboarding-body">
          <p>
            Trace does not motivate, reward, or correct you.
          </p>
          <p>
            It records what you avoid, what you honor, and what you justify — day after day — until patterns emerge.
          </p>
          <p>
            Nothing here is scored, reviewed, or judged.
          </p>
        </div>
        <button className="primary" onClick={handleNext}>
          I understand
        </button>
      </div>
    </div>
  );
}
