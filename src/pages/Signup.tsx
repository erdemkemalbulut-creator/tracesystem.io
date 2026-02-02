import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signUp(email, password);
      navigate('/onboarding/0');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-with-shell reflective-bg">
      <Header />
      <div className="page">
        <div className="onboarding-screen">
          <h1>Create account</h1>
          <div className="onboarding-body">
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label htmlFor="email" style={{ display: 'block', marginBottom: '0.5rem' }}>
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '6px',
                    border: '1px solid var(--color-border-muted)',
                    fontSize: '0.95rem',
                    backgroundColor: 'var(--color-bg-secondary)',
                    color: 'var(--color-text-primary)',
                  }}
                />
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label htmlFor="password" style={{ display: 'block', marginBottom: '0.5rem' }}>
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '6px',
                    border: '1px solid var(--color-border-muted)',
                    fontSize: '0.95rem',
                    backgroundColor: 'var(--color-bg-secondary)',
                    color: 'var(--color-text-primary)',
                  }}
                />
              </div>
              {error && (
                <div style={{ color: '#d32f2f', marginBottom: '1rem', fontSize: '0.9rem' }}>
                  {error}
                </div>
              )}
              <button type="submit" className="primary" disabled={loading}>
                {loading ? 'Creating account...' : 'Create account'}
              </button>
            </form>
            <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
              <Link to="/login" className="text-link">
                Already have an account? Log in
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
