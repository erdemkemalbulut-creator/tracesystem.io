import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PageTransition from '../components/PageTransition';
import useIntersectionObserver from '../hooks/useIntersectionObserver';
import { HomeCardIcon } from '../ui/icons';
import { Eye, Navigation, FileText } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();
  const { user, profile, loading } = useAuth();
  const observeRef = useIntersectionObserver();

  const handleContinue = () => {
    if (loading) return;
    if (!user) { navigate('/auth'); return; }
    if (!profile?.onboarding_complete) { navigate('/onboarding/01'); return; }
    navigate('/today');
  };

  return (
    <div className="page-with-shell reflective-bg">
      <Header />
      <PageTransition>
        {/* Hero */}
        <section className="hero">
          <div className="hero__visual">
            <svg viewBox="0 0 160 160" width="160" height="160">
              <defs>
                <linearGradient id="hero-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="var(--color-accent-blue)" />
                  <stop offset="100%" stopColor="var(--color-accent-purple)" />
                </linearGradient>
              </defs>
              <circle cx="80" cy="80" r="65" className="hero__ring-track" />
              <circle cx="80" cy="80" r="65" className="hero__ring-fill"
                transform="rotate(-90 80 80)" />
            </svg>
            <div className="hero__ring-label">
              <span className="hero__ring-day">30</span>
              <span className="hero__ring-caption">days</span>
            </div>
          </div>

          <h1 className="hero__heading">
            See what your behavior is actually optimizing for.
          </h1>
          <p className="hero__subtext">
            A 30-day system that records what you avoid, honor, and justify — until patterns become undeniable.
          </p>

          <div className="hero__cta">
            <button className="primary" onClick={handleContinue}>
              Start your 30-day season
            </button>
          </div>
          <p className="hero__trust">Free. Private. Under a minute per day.</p>
        </section>

        {/* Features */}
        <section className="landing-section scroll-reveal" ref={observeRef}>
          <p className="landing-section__title">How it works</p>
          <div className="feature-grid stagger">
            <div className="glass-card feature-card">
              <div className="feature-card__icon">
                <Eye size={20} aria-hidden="true" />
              </div>
              <p className="feature-card__title">Notice</p>
              <p className="feature-card__desc">
                Each day, name what you avoided that you knew mattered. One sentence.
              </p>
            </div>
            <div className="glass-card feature-card">
              <div className="feature-card__icon">
                <Navigation size={20} aria-hidden="true" />
              </div>
              <p className="feature-card__title">Act</p>
              <p className="feature-card__desc">
                Mark one act of alignment and one act of integrity. Did you follow through?
              </p>
            </div>
            <div className="glass-card feature-card">
              <div className="feature-card__icon">
                <FileText size={20} aria-hidden="true" />
              </div>
              <p className="feature-card__title">Reflect</p>
              <p className="feature-card__desc">
                Record what actually happened. No justification. Just the truth.
              </p>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="landing-section scroll-reveal" ref={observeRef}>
          <div className="stats-row stagger">
            <div className="glass-card stat-item">
              <span className="stat-item__value">30</span>
              <span className="stat-item__label">days of structured observation</span>
            </div>
            <div className="glass-card stat-item">
              <span className="stat-item__value">&lt; 1 min</span>
              <span className="stat-item__label">per daily entry</span>
            </div>
            <div className="glass-card stat-item">
              <span className="stat-item__value">4</span>
              <span className="stat-item__label">phases of self-evidence</span>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="landing-section scroll-reveal" ref={observeRef}>
          <p className="landing-section__title">Simple pricing</p>
          <div className="pricing-grid">
            <div className="glass-card pricing-card">
              <p className="pricing-card__name">Free</p>
              <p className="pricing-card__price">$0</p>
              <ul className="pricing-card__features">
                <li>Daily awareness + reflection entries</li>
                <li>Alignment & integrity tracking</li>
                <li>30-day seasons with checkpoints</li>
                <li>Light & dark theme</li>
                <li>Full archive access</li>
              </ul>
              <div className="pricing-card__cta">
                <button className="primary" onClick={handleContinue}>
                  Start free
                </button>
              </div>
            </div>
            <div className="glass-card pricing-card pricing-card--premium">
              <span className="pricing-card__badge">Coming Soon</span>
              <p className="pricing-card__name">Premium</p>
              <p className="pricing-card__price">$4 <span>/mo</span></p>
              <ul className="pricing-card__features">
                <li>Everything in Free</li>
                <li>Season analytics dashboard</li>
                <li>Alignment & integrity trends</li>
                <li>Pattern insights</li>
                <li>Export to PDF</li>
                <li>Multi-season comparison</li>
              </ul>
              <div className="pricing-card__cta">
                <button disabled>Coming soon</button>
              </div>
            </div>
          </div>
        </section>

        {/* Learn more */}
        <section className="learn-more scroll-reveal" ref={observeRef}>
          <p className="learn-more__title">Learn more</p>
          <div className="context-cards-grid">
            <Link to="/why" className="context-card" aria-label="What this system does (and doesn't)">
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <HomeCardIcon name="What this system does (and doesn't)" />
                <span>What this system does (and doesn't)</span>
              </span>
            </Link>
            <Link to="/writing/why-trace-exists" className="context-card" aria-label="Why this system exists">
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <HomeCardIcon name="Why this system exists" />
                <span>Why this system exists</span>
              </span>
            </Link>
            <Link to="/expect" className="context-card" aria-label="What to expect over 30 days">
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <HomeCardIcon name="What to expect over 30 days" />
                <span>What to expect over 30 days</span>
              </span>
            </Link>
            <Link to="/definition" className="context-card" aria-label="Definitions">
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <HomeCardIcon name="Definitions" />
                <span>Definitions</span>
              </span>
            </Link>
          </div>
        </section>
      </PageTransition>
      <Footer />
    </div>
  );
}
