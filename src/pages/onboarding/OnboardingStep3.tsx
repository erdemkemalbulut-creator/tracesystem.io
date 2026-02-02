import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function OnboardingStep3() {
  const { updateProfile } = useAuth();
  const navigate = useNavigate();

  const handleYes = async () => {
    await updateProfile({ onboarding_step: 4 });
    navigate('/onboarding/4');
  };

  const handleNotNow = () => {
    navigate('/');
  };

  return (
    <div className="page">
      <div className="onboarding-screen">
        <h1>One last question.</h1>
        <div className="onboarding-prompt">
          <label>
            For the next 30 days, are you willing to pay attention to your actions —
            even when it's uncomfortable?
          </label>
        </div>
        <div className="button-group">
          <button className="primary" onClick={handleYes}>
            Yes
          </button>
          <button onClick={handleNotNow}>Not right now</button>
        </div>
      </div>
    </div>
  );
}
