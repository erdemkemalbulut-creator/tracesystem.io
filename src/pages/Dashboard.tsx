import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { captureError } from '../lib/sentry';
import Header from '../components/Header';
import PageTransition from '../components/PageTransition';
import ProgressRing from '../components/ProgressRing';
import TrendChart from '../components/TrendChart';
import { SkeletonBlock } from '../components/Skeleton';
import { Flame, Trophy, Target, Zap, Download } from 'lucide-react';

interface EntryData {
  day_number: number;
  alignment_done: boolean;
  integrity_done: boolean;
  ai_question_text: string | null;
  ai_question_answer: string | null;
  saved_at: string | null;
}

const PHASE_RANGES = [
  { name: 'Awareness', start: 1, end: 7 },
  { name: 'Honesty', start: 8, end: 14 },
  { name: 'Integrity', start: 15, end: 21 },
  { name: 'Stabilization', start: 22, end: 30 },
];

// Badge definitions
function computeBadges(entries: EntryData[], _currentStreak: number, maxStreak: number) {
  const badges: { icon: typeof Flame; label: string; earned: boolean }[] = [
    { icon: Flame, label: '3-day streak', earned: maxStreak >= 3 },
    { icon: Flame, label: '7-day streak', earned: maxStreak >= 7 },
    { icon: Flame, label: '14-day streak', earned: maxStreak >= 14 },
    { icon: Trophy, label: '30 days complete', earned: entries.length >= 30 },
    { icon: Target, label: 'Perfect day', earned: entries.some(e => e.alignment_done && e.integrity_done) },
    { icon: Zap, label: 'First entry', earned: entries.length >= 1 },
  ];
  return badges;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<EntryData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        const { data: season } = await supabase
          .from('seasons')
          .select('id')
          .eq('user_id', user.id)
          .eq('is_closed', false)
          .order('start_date', { ascending: false })
          .maybeSingle();

        if (!season) {
          setLoading(false);
          return;
        }

        const { data: entriesData } = await supabase
          .from('daily_entries')
          .select('day_number, alignment_done, integrity_done, ai_question_text, ai_question_answer, saved_at')
          .eq('user_id', user.id)
          .eq('season_id', season.id)
          .not('saved_at', 'is', null)
          .order('day_number', { ascending: true });

        setEntries(entriesData || []);
      } catch (error) {
        captureError(error, 'fetchDashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const daysCompleted = entries.length;
  const alignmentCount = entries.filter(e => e.alignment_done).length;
  const integrityCount = entries.filter(e => e.integrity_done).length;
  const bothCount = entries.filter(e => e.alignment_done && e.integrity_done).length;

  // Streaks
  let maxStreak = 0;
  let currentStreak = 0;
  for (let d = 1; d <= 30; d++) {
    if (entries.some(e => e.day_number === d)) {
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else {
      currentStreak = 0;
    }
  }

  // Most consistent phase
  const phaseConsistency = PHASE_RANGES.map(phase => {
    const phaseEntries = entries.filter(e => e.day_number >= phase.start && e.day_number <= phase.end);
    const total = phase.end - phase.start + 1;
    return { name: phase.name, pct: phaseEntries.length / total };
  });
  const bestPhase = phaseConsistency.reduce((a, b) => a.pct >= b.pct ? a : b, phaseConsistency[0]);

  // Heatmap + entry map
  const entryMap = new Map(entries.map(e => [e.day_number, e]));

  // Trend data
  const trendData = entries.map(e => ({
    day: e.day_number,
    alignment: e.alignment_done,
    integrity: e.integrity_done,
  }));

  // Badges
  const badges = computeBadges(entries, currentStreak, maxStreak);
  const earnedBadges = badges.filter(b => b.earned);

  if (loading) {
    return (
      <div className="page-with-shell reflective-bg">
        <Header variant="system" />
        <div className="page">
          <div className="skeleton-group" style={{ maxWidth: 560, paddingTop: '2rem' }}>
            <SkeletonBlock height="120px" />
            <SkeletonBlock height="160px" />
            <SkeletonBlock height="100px" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-with-shell reflective-bg">
      <Header variant="system" />
      <PageTransition>
      <div className="page">
        <div className="dashboard-container">

          <div className="dashboard-header">
            <h1>Dashboard</h1>
          </div>

          {/* Current streak */}
          {currentStreak > 0 && (
            <div className="glass-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', padding: '1rem 1.5rem' }}>
              <Flame size={20} style={{ color: 'var(--color-accent-blue)' }} />
              <span style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--color-text-primary)' }}>{currentStreak}</span>
              <span style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--color-text-muted)' }}>day streak</span>
            </div>
          )}

          {/* Progress ring + summary */}
          <div className="dashboard-progress">
            <ProgressRing current={daysCompleted} total={30} size={140} label="/ 30 days" />
            <div className="dashboard-summary">
              <div className="dashboard-stat">
                <span className="dashboard-stat__value">{alignmentCount}</span>
                <span className="dashboard-stat__label">Alignment</span>
              </div>
              <div className="dashboard-stat">
                <span className="dashboard-stat__value">{integrityCount}</span>
                <span className="dashboard-stat__label">Integrity</span>
              </div>
              <div className="dashboard-stat">
                <span className="dashboard-stat__value">{bothCount}</span>
                <span className="dashboard-stat__label">Both</span>
              </div>
            </div>
          </div>

          {/* Clickable heatmap */}
          <div className="dashboard-section">
            <h2>Season Map</h2>
            <div className="heatmap">
              {Array.from({ length: 30 }, (_, i) => {
                const day = i + 1;
                const entry = entryMap.get(day);
                let cls = 'heatmap__cell';
                if (entry) {
                  cls += entry.alignment_done && entry.integrity_done
                    ? ' heatmap__cell--full'
                    : ' heatmap__cell--partial';
                }

                if (entry) {
                  return (
                    <Link key={day} to={`/day/${day}`} className={`${cls} heatmap__cell--clickable`} title={`Day ${day} — tap to view`}>
                      <span className="heatmap__day">{day}</span>
                    </Link>
                  );
                }

                return (
                  <div key={day} className={cls} title={`Day ${day}`}>
                    <span className="heatmap__day">{day}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Badges */}
          {earnedBadges.length > 0 && (
            <div className="dashboard-section">
              <h2>Milestones</h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {badges.map((b, i) => (
                  <div
                    key={i}
                    className="glass-card"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.5rem 0.875rem',
                      borderRadius: '999px',
                      fontSize: '0.8125rem',
                      opacity: b.earned ? 1 : 0.3,
                      color: b.earned ? 'var(--color-accent-blue)' : 'var(--color-text-subtle)',
                    }}
                  >
                    <b.icon size={14} />
                    <span>{b.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Phase breakdown */}
          <div className="dashboard-section">
            <h2>Phase Breakdown</h2>
            <div className="phase-grid">
              {PHASE_RANGES.map(phase => {
                const phaseEntries = entries.filter(e => e.day_number >= phase.start && e.day_number <= phase.end);
                const total = phase.end - phase.start + 1;
                const align = phaseEntries.filter(e => e.alignment_done).length;
                const integ = phaseEntries.filter(e => e.integrity_done).length;
                return (
                  <div key={phase.name} className="glass-card phase-breakdown-card">
                    <p className="phase-breakdown-card__name">{phase.name}</p>
                    <p className="phase-breakdown-card__progress">{phaseEntries.length}/{total} days</p>
                    <p className="phase-breakdown-card__detail">
                      {align} aligned · {integ} integrity
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Trends — now free */}
          <div className="dashboard-section">
            <h2>Trends</h2>
            <div className="glass-card">
              <TrendChart data={trendData} />
            </div>
          </div>

          {/* Insights — now free */}
          <div className="dashboard-section">
            <h2>Insights</h2>
            <div className="insights-grid">
              <div className="glass-card insight-card">
                <p className="insight-card__value">{maxStreak}</p>
                <p className="insight-card__label">Longest streak</p>
              </div>
              <div className="glass-card insight-card">
                <p className="insight-card__value">{daysCompleted > 0 ? Math.round((alignmentCount / daysCompleted) * 100) : 0}%</p>
                <p className="insight-card__label">Alignment rate</p>
              </div>
              <div className="glass-card insight-card">
                <p className="insight-card__value">{bestPhase?.name || '—'}</p>
                <p className="insight-card__label">Most consistent phase</p>
              </div>
              <div className="glass-card insight-card">
                <p className="insight-card__value">{daysCompleted > 0 ? Math.round((bothCount / daysCompleted) * 100) : 0}%</p>
                <p className="insight-card__label">Full completion rate</p>
              </div>
            </div>
          </div>

          {/* Recent entries timeline */}
          {entries.length > 0 && (
            <div className="dashboard-section">
              <h2>Recent Entries</h2>
              <div className="glass-card" style={{ padding: '0.5rem' }}>
                {[...entries].reverse().slice(0, 7).map(e => (
                  <Link
                    key={e.day_number}
                    to={`/day/${e.day_number}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      color: 'inherit',
                      transition: 'background 0.15s ease',
                    }}
                    className="entry-timeline-item"
                  >
                    <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--color-text-secondary)', whiteSpace: 'nowrap', minWidth: '48px' }}>Day {e.day_number}</span>
                    <span style={{ flex: 1, fontSize: '0.8125rem', color: 'var(--color-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {e.ai_question_answer
                        ? e.ai_question_answer.slice(0, 60) + (e.ai_question_answer.length > 60 ? '...' : '')
                        : 'Entry recorded'}
                    </span>
                    <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-subtle)', whiteSpace: 'nowrap' }}>
                      {[e.alignment_done && 'A', e.integrity_done && 'I'].filter(Boolean).join(' · ') || '—'}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Export */}
          <div className="dashboard-section">
            <button className="primary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              <Download size={16} aria-hidden="true" />
              Export Season Report
            </button>
          </div>

        </div>
      </div>
      </PageTransition>
    </div>
  );
}
