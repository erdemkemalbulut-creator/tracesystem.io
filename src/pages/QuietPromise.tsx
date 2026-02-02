import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function QuietPromise() {
  const navigate = useNavigate();

  return (
    <div className="page-with-shell">
      <Header />
      <main className="article-content">
        <button onClick={() => navigate(-1)} className="back-link">
          Back
        </button>
        <article>
          <h1>The quiet promise of Trace.</h1>
          <p>If you use this system for 30 days:</p>
          <ul>
            <li>You will know yourself better than before.</li>
            <li>You will lose plausible deniability.</li>
            <li>You will gain leverage — whether you use it or not is your choice.</li>
          </ul>
          <p>That's the outcome.</p>
          <p>
            Trace. does not promise change.
            <br />
            It promises clarity.
          </p>
          <p>What you do with that clarity is up to you.</p>
        </article>
      </main>
      <Footer />
    </div>
  );
}
