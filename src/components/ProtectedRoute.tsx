import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="page">
        <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!profile?.onboarding_complete) {
    const allowedPaths = ['/', '/auth', '/about', '/feedback', '/quiet-promise', '/writing'];
    const isAllowed = allowedPaths.some(path => location.pathname === path || location.pathname.startsWith(path));
    const isOnboarding = location.pathname.startsWith('/onboarding');

    if (!isAllowed && !isOnboarding) {
      return <Navigate to="/onboarding/01" replace />;
    }
  }

  return <>{children}</>;
}
