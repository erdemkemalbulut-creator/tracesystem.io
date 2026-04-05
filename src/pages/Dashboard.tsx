import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { captureError } from '../lib/sentry';
import Header from '../components/Header';
import PageTransition from '../components/PageTransition';
import ProgressRing from '../components/ProgressRing';
import TrendChart from '../components/TrendChart';
import PremiumGate from '../components/PremiumGate';
import { SkeletonBlock } from '../components/Skeleton';
import { Download } from 'lucide-react';

interface EntryData {
  day_number: number;
  alignment_done: boolean;
  integrity_done: boolean;
  saved_at: string | null;
}

const PHASE_RANGES = [
  { name: 'Awareness', start: 1, end: 7 },
  { name: 'Honesty', start: 8, end: 14 },
  { name: 'Integrity', start: 15, end: 21 },
  { name: 'Stabilization', start: 22, end: 30 },
];

export default function Dashboard() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<EntryData[]>([]);
  const [loading, setLoading] = useState(true);
  const isPremium = false; // Premium gate placeholder

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
          .select('day_number, alignment_done, integrity_done, saved_at')
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

  // Longest streak
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

  // Heatmap data
  const entryMap = new Map(entries.map(e => [e.day_number, e]));

  // Trend data
  const trendData = entries.map(e => ({
    day: e.day_number,
    alignment: e.alignment_done,
    integrity: e.integrity_done,
  }));

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

          {/* Heatmap */}
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
                return (
                  <div key={day} className={cls} title={`Day ${day}`}>
                    <span className="heatmap__day">{day}</span>
                  </div>
                );
              })}
            </div>
          </div>

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

          {/* Trend chart — premium */}
          <div className="dashboard-section">
            <h2>Trends</h2>
            <PremiumGate isPremium={isPremium} featureName="Trend Analysis">
              <TrendChart data={trendData} />
            </PremiumGate>
          </div>

          {/* Pattern insights — premium */}
          <div className="dashboard-section">
            <h2>Insights</h2>
            <PremiumGate isPremium={isPremium} featureName="Pattern Insights">
              <div className="insights-grid">
                <div className="glass-card insight-card">
                  <p className="insight-card__value">{maxStreak}</p>
                  <p className="insight-card__label">Longest consecutive streak</p>
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
            </PremiumGate>
          </div>

          {/* Export — premium */}
          <div className="dashboard-section">
            <PremiumGate isPremium={isPremium} featureName="Season Export">
              <button className="primary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <Download size={16} aria-hidden="true" />
                Export Season Report
              </button>
            </PremiumGate>
          </div>

        </div>
      </div>
      </PageTransition>
    </div>
  );
}
