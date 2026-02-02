import { useState, type FormEvent } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

function Feedback() {
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (message.trim()) {
      console.log('Feedback submitted:', { message, email });

      const feedback = {
        message,
        email,
        timestamp: new Date().toISOString(),
      };

      const existingFeedback = localStorage.getItem('trace_feedback');
      const feedbackArray = existingFeedback ? JSON.parse(existingFeedback) : [];
      feedbackArray.push(feedback);
      localStorage.setItem('trace_feedback', JSON.stringify(feedbackArray));

      setSubmitted(true);
      setMessage('');
      setEmail('');
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
            <button type="submit" className="primary">
              Send feedback
            </button>
          </form>
        )}
      </main>
      <Footer />
    </div>
  );
}

export default Feedback;
