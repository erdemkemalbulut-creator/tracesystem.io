import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Auth() {
  const [mode, setMode] = useState<'signup' | 'login'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp, signIn, user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (authLoading) return;

    if (user && profile) {
      if (profile.onboarding_complete) {
        navigate('/today');
      } else {
        navigate(`/onboarding/${profile.onboarding_step || 0}`);
      }
    }
  }, [user, profile, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'signup') {
        await signUp(email, password);
      } else {
        await signIn(email, password);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="auth-container">
        <h1>{mode === 'signup' ? 'Create account' : 'Log in'}</h1>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-field">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="form-field">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              minLength={6}
            />
          </div>

          {error && <p className="error-message">{error}</p>}

          <p className="auth-helper">
            This creates a private space for your daily entries.
            <br />
            Your data is not shared.
          </p>

          <button type="submit" className="primary" disabled={loading}>
            {loading ? 'Loading...' : mode === 'signup' ? 'Create account' : 'Log in'}
          </button>
        </form>

        {mode === 'login' && (
          <button
            type="button"
            className="forgot-password-link"
            onClick={() => setError('Password reset coming soon. For now, create a new account.')}
          >
            Forgot password?
          </button>
        )}

        <div className="auth-toggle">
          {mode === 'signup' ? (
            <p>
              Already have an account?{' '}
              <button
                type="button"
                className="text-button"
                onClick={() => {
                  setMode('login');
                  setError('');
                }}
              >
                Log in
              </button>
            </p>
          ) : (
            <p>
              Don't have an account?{' '}
              <button
                type="button"
                className="text-button"
                onClick={() => {
                  setMode('signup');
                  setError('');
                }}
              >
                Create account
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
