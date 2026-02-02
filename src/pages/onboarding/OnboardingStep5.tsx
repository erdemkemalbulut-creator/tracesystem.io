import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

export default function OnboardingStep5() {
  const { updateProfile, user } = useAuth();
  const navigate = useNavigate();

  const handleComplete = async () => {
    if (!user) return;

    await supabase
      .from('seasons')
      .insert({
        user_id: user.id,
        start_date: new Date().toISOString(),
      });

    await updateProfile({
      onboarding_step: 5,
      onboarding_complete: true,
    });

    navigate('/today');
  };

  return (
    <div className="page">
      <div className="onboarding-screen">
        <h1>Here's how this works.</h1>
        <div className="onboarding-bullets">
          <ul>
            <li>One act of alignment per day</li>
            <li>One act of integrity</li>
            <li>One honest reflection</li>
          </ul>
          <p className="footer-text">That's it.</p>
        </div>
        <button className="primary" onClick={handleComplete}>
          Start Day 1
        </button>
      </div>
    </div>
  );
}
