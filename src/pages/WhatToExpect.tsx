import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function WhatToExpect() {
  const navigate = useNavigate();

  return (
    <div className="page-with-shell">
      <Header />
      <main className="article-content">
        <button onClick={() => navigate(-1)} className="back-link">
          Back
        </button>

        <h1>What to Expect</h1>

        <div className="about-content">
          <section className="about-section">
            <p>If you use this system for 30 days, nothing dramatic will happen — but something precise will.</p>
            <p>Trace will feel simple at first. Then it may feel uncomfortable.</p>
            <p>
              You will not be told what to do.
              <br />
              You will not be corrected.
            </p>
            <p>
              Some days will feel uneventful.
              <br />
              Some days will feel revealing.
            </p>
            <p>What counts is not consistency, insight, or performance.</p>
            <p>What counts is honesty.</p>
            <p>If you keep recording, patterns will appear — without effort.</p>
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
