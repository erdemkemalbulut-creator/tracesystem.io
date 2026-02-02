import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getDayNumber } from '../utils/storage';
import Header from '../components/Header';

export default function DayComplete() {
  const dayNumber = Math.min(getDayNumber(), 30);
  const [timeUntilNext, setTimeUntilNext] = useState('');

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setHours(24, 0, 0, 0);
      const diff = tomorrow.getTime() - now.getTime();

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeUntilNext(
        `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
      );
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="page-with-shell reflective-bg">
      <Header variant="system" />
      <div className="page">
        <div className="completion-container">
          <div className="completion-section">
            <h1>Today is complete.</h1>
          </div>

          <div className="completion-section">
            <p className="completion-body">The system will open again in:</p>
            <p className="completion-body" style={{ fontSize: '1.5rem', fontWeight: '500', marginTop: '0.5rem' }}>
              {timeUntilNext}
            </p>
            <p className="completion-tip" style={{ marginTop: '1rem' }}>
              One entry per day. Nothing more is expected.
            </p>
          </div>

          <div className="completion-section">
            <p className="completion-tip">Trace records time, not effort.</p>
          </div>

          <Link to={`/day/${dayNumber}`}>
            <button className="primary completion-primary">
              Review today's entry
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
