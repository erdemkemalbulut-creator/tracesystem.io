import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function WhyUseTrace() {
  const navigate = useNavigate();

  return (
    <div className="page-with-shell">
      <Header />
      <main className="article-content">
        <button onClick={() => navigate(-1)} className="back-link">
          Back
        </button>

        <h1>Why Use Trace</h1>

        <div className="about-content">
          <section className="about-section">
            <p>This system exists to make behavior visible — not to change it, correct it, or optimize it.</p>
            <p>If you use Trace for 7 days, you will notice repetition.</p>
            <p>If you use it for 14 days, you will see tension between intention and action.</p>
            <p>If you use it for 30 days, you will have evidence — not stories — about what your behavior protects.</p>
            <p>
              Trace does not promise improvement.
              <br />
              It promises the end of plausible deniability.
            </p>
          </section>

          <section className="about-section">
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', textAlign: 'center' }}>
              If you're ready, you can <a href="/" style={{ color: 'var(--color-text-muted)', textDecoration: 'underline' }}>enter the system</a>.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
