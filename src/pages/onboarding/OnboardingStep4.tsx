import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function OnboardingStep4() {
  const { updateProfile } = useAuth();
  const navigate = useNavigate();

  const handleNext = async () => {
    await updateProfile({ onboarding_step: 5 });
    navigate('/onboarding/5');
  };

  return (
    <div className="page">
      <div className="onboarding-screen">
        <h1>This is the season you're entering.</h1>
        <div className="onboarding-statement">
          <p className="statement">
            I am someone whose actions match my values, even when it's uncomfortable.
          </p>
          <p className="subtext">
            You're not claiming this is true yet.
            <br />
            You're choosing to practice it.
          </p>
        </div>
        <button className="primary" onClick={handleNext}>
          Accept and begin
        </button>
      </div>
    </div>
  );
}
