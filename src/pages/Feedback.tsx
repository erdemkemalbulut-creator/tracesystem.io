import { useState, type FormEvent } from 'react';
import { supabase } from '../lib/supabase';
import { captureError } from '../lib/sentry';
import Header from '../components/Header';
import Footer from '../components/Footer';

function Feedback() {
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setSubmitting(true);
    setErrorMsg('');

    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase.from('feedback').insert({
        message: message.trim(),
        email: email.trim() || null,
        user_id: user?.id ?? null,
      });

      if (error) throw error;

      setSubmitted(true);
      setMessage('');
      setEmail('');
    } catch (error) {
      captureError(error, 'submitFeedback');
      setErrorMsg('Failed to send feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-with-shell">
      <Header />
      <main className="feedback-content">
        <h1>Feedback</h1>
        <p className="feedback-intro">
          Trace. is early.
          <br />
          If something feels unclear, unnecessary, or missing, say so.
        </p>

        {submitted ? (
          <div className="feedback-success">Noted.</div>
        ) : (
          <form onSubmit={handleSubmit} className="feedback-form">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="What should this system do better?"
              required
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email (optional)"
            />
            {errorMsg && <p className="error-message">{errorMsg}</p>}
            <button type="submit" className="primary" disabled={submitting}>
              {submitting ? 'Sending...' : 'Send feedback'}
            </button>
          </form>
        )}
      </main>
      <Footer />
    </div>
  );
}

export default Feedback;
