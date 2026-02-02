import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function About() {
  const navigate = useNavigate();

  return (
    <div className="page-with-shell">
      <Header />
      <main className="article-content">
        <button onClick={() => navigate(-1)} className="back-link">
          Back
        </button>
        <div className="about-opening">
          <p className="about-opening-line">Trace. produces self-evidence.</p>
        </div>

        <div className="about-content">
          <section className="about-section">
            <p>Trace. is a private identity steering system.</p>
            <p>
              It does not help you improve.
              <br />
              It helps you observe.
            </p>
            <p>
              Most people believe their behavior is guided by goals, values, or discipline.
              <br />
              In reality, behavior follows identity — often unconsciously.
            </p>
            <p>Trace. exists to make that visible.</p>
          </section>

          <section className="about-section">
            <h2>What this system does</h2>
            <p>Trace. helps you observe what your behavior is actually optimizing for over time.</p>
            <p>
              Not what you say you care about.
              <br />
              Not what you intend to do.
              <br />
              But what your actions consistently protect, avoid, and reinforce.
            </p>
            <p>The system does this through a simple daily loop:</p>
            <ul>
              <li>Awareness</li>
              <li>Alignment</li>
              <li>Integrity</li>
              <li>Reflection</li>
            </ul>
            <p>Nothing more.</p>
          </section>

          <section className="about-section">
            <h2>What this system does not do</h2>
            <p>Trace. is not:</p>
            <ul>
              <li>A habit tracker</li>
              <li>A productivity tool</li>
              <li>A goal system</li>
              <li>A motivation engine</li>
              <li>A self-improvement program</li>
            </ul>
            <p>
              It does not reward you.
              <br />
              It does not correct you.
              <br />
              It does not encourage you.
            </p>
            <p>It records.</p>
          </section>

          <section className="about-section">
            <h2>How the daily loop works</h2>
            <p>
              <strong>Awareness:</strong>
              <br />
              You notice what you avoided or resisted.
            </p>
            <p>
              <strong>Alignment:</strong>
              <br />
              You do one thing you've been avoiding that you know matters.
            </p>
            <p>
              <strong>Integrity:</strong>
              <br />
              You honor one promise to yourself, even when no one is watching.
            </p>
            <p>
              <strong>Reflection:</strong>
              <br />
              You answer one question honestly about how the day actually went.
            </p>
            <p>
              This loop does not optimize performance.
              <br />
              It optimizes perception.
            </p>
          </section>

          <section className="about-section">
            <h2>What a "good day" means here</h2>
            <p>A good day is not doing everything right.</p>
            <p>A good day is an honest record of how the day actually went.</p>
            <p>
              You can miss both actions and still have a good day if the reflection is truthful.
              <br />
              You can complete everything and still have a bad day if the reflection is evasive.
            </p>
            <p>Trace. optimizes for truth, not progress.</p>
          </section>

          <section className="about-section">
            <h2>Privacy and stakes</h2>
            <p>
              Your data stays local.
              <br />
              Your reflections are private.
            </p>
            <p>
              There are no streaks, scores, or social features.
              <br />
              Comparison weakens honesty.
            </p>
            <p>The only stake in this system is awareness.</p>
            <p>
              For some people, that is enough.
              <br />
              For others, it is uncomfortable.
            </p>
            <p>That discomfort is not a bug.</p>
          </section>

          <section className="about-section">
            <h2>Who this system is for</h2>
            <p>
              Trace. is for people who suspect their behavior does not match their self-image.
              <br />
              People who are tired of motivation.
              <br />
              People who want clarity before change.
            </p>
            <p>It is not for people looking to feel better quickly.</p>
          </section>

          <section className="about-section">
            <h2>What this system produces</h2>
            <p>After a season, you will know:</p>
            <ul>
              <li>What you consistently avoid</li>
              <li>What you protect under pressure</li>
              <li>What you honor when no one is watching</li>
              <li>What kind of person your actions describe</li>
            </ul>
            <p>What you do with that knowledge is your choice.</p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
