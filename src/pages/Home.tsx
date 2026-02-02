import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { HomeCardIcon } from '../ui/icons';

export default function Home() {
  const navigate = useNavigate();
  const { user, profile, loading } = useAuth();

  const handleContinue = () => {
    if (loading) return;

    if (!user) {
      navigate('/auth');
      return;
    }

    if (!profile?.onboarding_complete) {
      navigate('/onboarding/01');
      return;
    }

    navigate('/today');
  };

  return (
    <div className="page-with-shell reflective-bg">
      <Header />
      <div className="page">
        <div className="onboarding-screen">
          <div className="onboarding-body">
            <p>
              Trace. is a behavioral mirror with delayed reflection.
            </p>
            <p>
              It records what you avoid, what you honor, and what you justify — day after day — until patterns emerge.
            </p>
            <p>
              Trace does not motivate, reward, or correct.
              <br />
              It helps you see what your behavior is actually optimizing for, over time.
            </p>
          </div>
          <button className="primary" onClick={handleContinue}>
            Enter the system
          </button>
          <p className="cta-assurance">Private. Free. No identity required.</p>

          <div className="section-divider" />

          <div className="context-section">
            <p className="meta-text">
              Before entering, you may want context.
            </p>
            <div className="context-cards-grid">
              <Link
                to="/why"
                className="context-card"
                aria-label="What this system does (and doesn't)"
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <HomeCardIcon name="What this system does (and doesn't)" />
                  <span>What this system does (and doesn't)</span>
                </span>
              </Link>
              <Link
                to="/writing/why-trace-exists"
                className="context-card"
                aria-label="Why this system exists"
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <HomeCardIcon name="Why this system exists" />
                  <span>Why this system exists</span>
                </span>
              </Link>
              <Link
                to="/expect"
                className="context-card"
                aria-label="What to expect over 30 days"
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <HomeCardIcon name="What to expect over 30 days" />
                  <span>What to expect over 30 days</span>
                </span>
              </Link>
              <Link
                to="/definition"
                className="context-card"
                aria-label="Definitions"
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <HomeCardIcon name="Definitions" />
                  <span>Definitions</span>
                </span>
              </Link>
            </div>
            <p className="meta-text">
              None of this is required to begin.
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
