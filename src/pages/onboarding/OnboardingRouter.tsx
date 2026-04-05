import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import PageTransition from '../../components/PageTransition';
import { SkeletonLine, SkeletonBlock } from '../../components/Skeleton';
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
        <div className="skeleton-group" style={{ maxWidth: 560, paddingTop: '2rem' }}>
          <SkeletonLine width="60%" height="1rem" />
          <SkeletonLine width="90%" />
          <SkeletonBlock height="80px" />
        </div>
      </div>
    );
  }

  if (!profile || !user) {
    return null;
  }

  let content: React.ReactNode = null;
  switch (step) {
    case '01': content = <Onboarding01 />; break;
    case '02': content = <Onboarding02 />; break;
    case '03': content = <Onboarding03 />; break;
    case '04': content = <Onboarding04 />; break;
    case '05': content = <Onboarding05 />; break;
    case '06': content = <Onboarding06 />; break;
    case '07': content = <Onboarding07 />; break;
  }

  return (
    <PageTransition key={step}>
      {content}
    </PageTransition>
  );
}
