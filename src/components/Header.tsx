import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sun, Moon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { HeaderIcons } from '../ui/icons';

interface HeaderProps {
  variant?: 'website' | 'system';
  showSettings?: boolean;
  showArchive?: boolean;
  showReview?: boolean;
  showBack?: boolean;
  backTo?: string;
  isTerminalState?: boolean;
  hideThemeToggle?: boolean;
}

function Header({
  variant = 'website',
  showSettings = false,
  showArchive = false,
  showReview = false,
  showBack = false,
  backTo = '/today',
  isTerminalState = false,
  hideThemeToggle = false,
}: HeaderProps = {}) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const handleAuthClick = async () => {
    if (user) {
      await signOut();
      navigate('/');
    } else {
      navigate('/login');
    }
  };

  const getLogoDestination = () => {
    return '/';
  };

  if (variant === 'system') {
    return (
      <header className="header">
        <div className="header-content">
          <div className="header-left">
            <div className="logo">Trace.</div>
            <div className="logo-subtitle">Behavioral system</div>
          </div>
          <div className="header-right" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="theme-toggle"
              aria-label="Dashboard"
            >
              <HeaderIcons.Dashboard size={18} aria-hidden="true" />
            </button>
            <button
              onClick={() => navigate(`/day/${Math.min(getDayNumber(), 30)}`)}
              className="theme-toggle"
              aria-label="Review entry"
            >
              <HeaderIcons.Review size={18} aria-hidden="true" />
            </button>
            <button
              onClick={() => navigate('/settings')}
              className="theme-toggle"
              aria-label="Settings"
            >
              <HeaderIcons.Settings size={18} aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="header">
      <div className="header-content">
        {showBack ? (
          <button
            onClick={() => navigate(backTo)}
            className="text-link"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
            aria-label="Back"
          >
            <HeaderIcons.Back size={18} aria-hidden="true" />
            <span>Back</span>
          </button>
        ) : (
          <Link to={getLogoDestination()} className="header-left">
            <div className="logo">Trace.</div>
            <div className="logo-subtitle">Behavioral system</div>
          </Link>
        )}
        <div className="header-right" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {showSettings && (
            <Link
              to="/settings"
              className="text-link"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
              aria-label="Settings"
            >
              <HeaderIcons.Settings size={18} aria-hidden="true" />
              <span>Settings</span>
            </Link>
          )}
          {showArchive && (
            <Link
              to="/settings"
              className="text-link"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
              aria-label="Archive"
            >
              <HeaderIcons.Archive size={18} aria-hidden="true" />
              <span>Archive</span>
            </Link>
          )}
          {showReview && (
            <button
              onClick={() => navigate(`/day/${Math.min(getDayNumber(), 30)}`)}
              className="text-link"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
              aria-label="Review entry"
            >
              <HeaderIcons.Review size={18} aria-hidden="true" />
              <span>Review</span>
            </button>
          )}
          {!hideThemeToggle && (
            <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>
          )}
          {!isTerminalState && user && (
            <button className="login-btn" onClick={handleAuthClick}>
              Sign out
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

function getDayNumber(): number {
  const startDateStr = localStorage.getItem('traceStartDate');
  if (!startDateStr) return 1;

  const startDate = new Date(startDateStr);
  const today = new Date();
  startDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  const diffTime = today.getTime() - startDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  return diffDays + 1;
}

export default Header;
