import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function Definitions() {
  const navigate = useNavigate();

  return (
    <div className="page-with-shell">
      <Header />
      <main className="article-content">
        <button onClick={() => navigate(-1)} className="back-link">
          Back
        </button>

        <h1>Definitions</h1>

        <div className="about-content">
          <section className="about-section">
            <p>This system uses a small set of terms deliberately. Their meaning matters.</p>
            <p>
              These definitions are specific to this system.
            </p>
            <p>
              They are not motivational.
              <br />
              They are not symbolic.
              <br />
              They are operational.
            </p>
          </section>

          <section className="about-section">
            <h2>Awareness</h2>
            <p>Awareness is not insight.</p>
            <p>
              It is sustained attention to what actually happened, without explanation or correction.
            </p>
            <p>In Trace, awareness means noticing:</p>
            <ul>
              <li>What you avoided</li>
              <li>What you repeated</li>
              <li>What required justification</li>
            </ul>
            <p>
              Awareness accumulates.
              <br />
              It is not instantaneous.
            </p>
          </section>

          <section className="about-section">
            <h2>Avoidance</h2>
            <p>Avoidance is not inactivity.</p>
            <p>
              It is the repeated choice of short-term relief over long-term alignment.
            </p>
            <p>
              Avoidance often looks reasonable.
              <br />
              That is why it persists.
            </p>
          </section>

          <section className="about-section">
            <h2>Alignment</h2>
            <p>Alignment is not intensity or effort.</p>
            <p>
              It is doing what you already know matters, without negotiation.
            </p>
            <p>
              In Trace, alignment is binary:
              <br />
              it happened, or it did not.
            </p>
          </section>

          <section className="about-section">
            <h2>Integrity</h2>
            <p>Integrity is not morality.</p>
            <p>
              It is consistency between what you say matters and what your actions protect.
            </p>
            <p>
              Integrity is private.
              <br />
              It exists even when no one is watching.
            </p>
          </section>

          <section className="about-section">
            <h2>Justification</h2>
            <p>A justification is not a lie.</p>
            <p>
              It is a story that allows a pattern to continue without confrontation.
            </p>
            <p>
              Justifications repeat.
              <br />
              That repetition is evidence.
            </p>
          </section>

          <section className="about-section">
            <h2>Reflection</h2>
            <p>Reflection is not analysis.</p>
            <p>
              It is an accurate record of the day as it occurred.
            </p>
            <p>
              Reflection in Trace is not meant to feel complete.
              <br />
              It is meant to be honest.
            </p>
          </section>

          <section className="about-section">
            <h2>A "Good Day"</h2>
            <p>A good day is not a successful day.</p>
            <p>A good day is an accurate one.</p>
            <p>
              You can avoid everything and still have a good day if the record is truthful.
              <br />
              You can do everything and still have a bad day if the record is evasive.
            </p>
            <p>Accuracy is the only metric.</p>
          </section>

          <section className="about-section">
            <h2>Pattern</h2>
            <p>In Trace, a pattern is a repeated behavioral structure that persists over time.</p>
            <p>A pattern:</p>
            <ul>
              <li>Does not require interpretation</li>
              <li>Does not depend on intention</li>
              <li>Appears through repetition alone</li>
            </ul>
            <p>Patterns are shown, not explained.</p>
          </section>

          <section className="about-section">
            <h2>Season</h2>
            <p>A season is a fixed observation window.</p>
            <p>In Trace, a season lasts 30 recorded days.</p>
            <p>A season:</p>
            <ul>
              <li>Has a beginning</li>
              <li>Has an end</li>
              <li>Does not reset behavior</li>
              <li>Only separates time</li>
            </ul>
            <p>Seasons exist to prevent drift and false continuity.</p>
            <p>Nothing changes when a season ends except visibility.</p>
          </section>

          <section className="about-section">
            <h2>Progress</h2>
            <p>Progress is not required.</p>
            <p>
              Trace does not measure improvement.
              <br />
              It measures reality.
            </p>
          </section>

          <section className="about-section">
            <h2>Change</h2>
            <p>Change is optional.</p>
            <p>Clarity is not.</p>
            <p>
              Trace does not ask you to change who you are.
              <br />
              It shows who your actions describe.
            </p>
          </section>

          <section className="about-section">
            <h2>The System</h2>
            <p>Trace is a behavioral mirror with delayed reflection.</p>
            <p>
              It does not guide behavior.
              <br />
              It does not suggest corrections.
              <br />
              It does not interpret what it records.
            </p>
            <p>
              It reflects what your actions consistently optimize for — not immediately, but over time.
            </p>
            <p>
              What appears in the mirror is not intention or self-image.
              <br />
              It is repetition.
            </p>
            <p>
              As patterns accumulate, identity becomes harder to maintain without adjustment.
            </p>
            <p>
              Trace does not steer by instruction.
              <br />
              It steers by visibility.
            </p>
          </section>

          <section className="about-section">
            <h2>What follows</h2>
            <p>What you do with that reflection is not managed here.</p>
            <p>
              Trace does not close the loop for you.
              <br />
              It leaves it open.
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
