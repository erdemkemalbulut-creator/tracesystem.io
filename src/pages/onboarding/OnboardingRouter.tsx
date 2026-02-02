import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Onboarding01 from './Onboarding01';
import Onboarding02 from './Onboarding02';
import Onboarding03 from './Onboarding03';
import Onboarding04 from './Onboarding04';
import Onboarding05 from './Onboarding05';
import Onboarding06 from './Onboarding06';
import Onboarding07 from './Onboarding07';

export default function OnboardingRouter() {
  const { step } = useParams<{ step: string }>();
  const { profile, loading, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      navigate('/auth');
      return;
    }

    if (profile?.onboarding_complete) {
      navigate('/today');
      return;
    }

    if (!step || !['01', '02', '03', '04', '05', '06', '07'].includes(step)) {
      navigate('/onboarding/01');
    }
  }, [profile, loading, user, step, navigate]);

  if (loading) {
    return (
      <div className="page">
        <div className="onboarding-screen">
          <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (!profile || !user) {
    return null;
  }

  switch (step) {
    case '01':
      return <Onboarding01 />;
    case '02':
      return <Onboarding02 />;
    case '03':
      return <Onboarding03 />;
    case '04':
      return <Onboarding04 />;
    case '05':
      return <Onboarding05 />;
    case '06':
      return <Onboarding06 />;
    case '07':
      return <Onboarding07 />;
    default:
      return null;
  }
}
