import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { clearAllData } from '../utils/storage';
import { supabase } from '../lib/supabase';
import { captureError } from '../lib/sentry';
import { SectionIcon, HeaderIcons } from '../ui/icons';
import Header from '../components/Header';

interface DailyEntry {
  id: string;
  day_number: number;
  orientation_text: string | null;
  alignment_done: boolean;
  integrity_done: boolean;
  reflection_text: string;
  saved_at: string;
}

interface SeasonWithEntries {
  season_number: number;
  entries: DailyEntry[];
}

export default function Settings() {
  const navigate = useNavigate();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [expandedDay, setExpandedDay] = useState<string | null>(null);
  const [expandedSeason, setExpandedSeason] = useState<number | null>(null);
  const [seasons, setSeasons] = useState<SeasonWithEntries[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSeasons();
  }, []);

  const fetchSeasons = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: seasonsData } = await supabase
        .from('seasons')
        .select('id, season_number')
        .eq('user_id', user.id)
        .order('season_number', { ascending: false });

      if (!seasonsData) {
        setLoading(false);
        return;
      }

      const seasonsWithEntries: SeasonWithEntries[] = [];

      for (const season of seasonsData) {
        const { data: entriesData } = await supabase
          .from('daily_entries')
          .select('id, day_number, orientation_text, alignment_done, integrity_done, reflection_text, saved_at')
          .eq('season_id', season.id)
          .order('day_number', { ascending: true });

        if (entriesData && entriesData.length > 0) {
          seasonsWithEntries.push({
            season_number: season.season_number,
            entries: entriesData,
          });
        }
      }

      setSeasons(seasonsWithEntries);
      if (seasonsWithEntries.length > 0) {
        setExpandedSeason(seasonsWithEntries[0].season_number);
      }
      setLoading(false);
    } catch (error) {
      captureError(error, 'fetchSeasons');
      setLoading(false);
    }
  };

  const handleExitSystem = () => {
    navigate('/');
  };

  const handleResetClick = () => {
    setShowConfirmation(true);
  };

  const handleConfirmReset = () => {
    if (confirmText === 'RESET') {
      clearAllData();
      navigate('/onboarding');
    }
  };

  const handleCancel = () => {
    setShowConfirmation(false);
    setConfirmText('');
  };

  const toggleSeason = (seasonNumber: number) => {
    setExpandedSeason(expandedSeason === seasonNumber ? null : seasonNumber);
  };

  const toggleDay = (seasonNumber: number, dayNumber: number) => {
    const key = `${seasonNumber}-${dayNumber}`;
    setExpandedDay(expandedDay === key ? null : key);
  };

  return (
    <div className="page-with-shell reflective-bg">
      <Header variant="system" />
      <div className="page">
        <div className="settings-container">
          <div className="settings-header">
            <h1>Settings</h1>
          </div>

        <div className="settings-section">
          <h2>Navigation</h2>
          <button onClick={() => navigate('/today')}>
            Back to today
          </button>
          <p className="completion-tip" style={{ marginTop: '0.5rem' }}>
            Return to the current day's entry.
          </p>
        </div>

        <div className="settings-section">
          <h2>Archive</h2>
          <p className="completion-tip" style={{ marginBottom: '0.5rem' }}>
            These entries are preserved exactly as recorded.
          </p>
          <p className="completion-tip" style={{ marginBottom: '1rem' }}>
            Seasons are separate observation windows.
          </p>

          <div className="archive-container">
            {loading ? (
              <p className="completion-tip" style={{ margin: 0 }}>Loading archive...</p>
            ) : seasons.length === 0 ? (
              <p className="completion-tip" style={{ margin: 0 }}>No entries recorded yet.</p>
            ) : (
              <div className="archive-list">
                {seasons.map((season) => {
                  const isSeasonExpanded = expandedSeason === season.season_number;
                  const recordedDaysCount = season.entries.length;

                  return (
                    <div key={season.season_number} className="archive-season">
                      <button
                        className="archive-season-button"
                        onClick={() => toggleSeason(season.season_number)}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}
                      >
                        <div>
                          <span className="archive-season-label">Season {season.season_number}</span>
                          <span className="archive-season-count">
                            {recordedDaysCount} recorded day{recordedDaysCount !== 1 ? 's' : ''}
                          </span>
                        </div>
                        {isSeasonExpanded ? (
                          <HeaderIcons.ChevronUp size={18} aria-hidden="true" style={{ color: 'currentColor' }} />
                        ) : (
                          <HeaderIcons.ChevronDown size={18} aria-hidden="true" style={{ color: 'currentColor' }} />
                        )}
                      </button>
                      {isSeasonExpanded && (
                        <div className="archive-season-entries">
                          {season.entries.map((entry) => {
                            const dayKey = `${season.season_number}-${entry.day_number}`;
                            const isDayExpanded = expandedDay === dayKey;

                            return (
                              <div key={dayKey} className="archive-item">
                                <button
                                  className="archive-day-button"
                                  onClick={() => toggleDay(season.season_number, entry.day_number)}
                                >
                                  <span className="archive-day-label">Day {entry.day_number}</span>
                                  <span className="archive-indicators">
                                    Alignment: {entry.alignment_done ? 'Done' : 'Not done'} | Integrity: {entry.integrity_done ? 'Done' : 'Not done'}
                                  </span>
                                </button>
                                {isDayExpanded && (
                                  <div className="archive-entry-details">
                                    <div className="archive-field">
                                      <strong style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <SectionIcon name="Awareness" />
                                        <span>— Awareness —</span>
                                      </strong>
                                      <p>{entry.orientation_text || 'Not recorded'}</p>
                                    </div>
                                    <div className="archive-field">
                                      <strong style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <SectionIcon name="Alignment" />
                                        <span>— Alignment —</span>
                                      </strong>
                                      <p>{entry.alignment_done ? 'Done' : 'Not done'}</p>
                                    </div>
                                    <div className="archive-field">
                                      <strong style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <SectionIcon name="Integrity" />
                                        <span>— Integrity —</span>
                                      </strong>
                                      <p>{entry.integrity_done ? 'Done' : 'Not done'}</p>
                                    </div>
                                    <div className="archive-field">
                                      <strong style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <SectionIcon name="Reflection" />
                                        <span>— Reflection —</span>
                                      </strong>
                                      <p>{entry.reflection_text}</p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <p className="completion-tip" style={{ marginTop: '1rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
            Nothing here is interpreted.
          </p>
        </div>

        <div className="settings-section" style={{ marginTop: '4rem' }}>
          <h2>Session</h2>
          <button className="text-link" onClick={handleExitSystem}>
            Exit system
          </button>
          <p className="completion-tip" style={{ marginTop: '0.5rem' }}>
            You can return at any time.
          </p>
        </div>

        <div className="settings-section" style={{ marginTop: '4rem', paddingTop: '2rem', borderTop: '1px solid var(--color-border)' }}>
          <h2>Danger zone</h2>
          {!showConfirmation ? (
            <>
              <button onClick={handleResetClick}>Reset my data</button>
              <p className="completion-tip" style={{ marginTop: '0.5rem' }}>
                Deletes all entries and archives. This cannot be undone.
              </p>
            </>
          ) : (
            <div className="reset-confirmation">
              <h3 style={{ marginBottom: '1rem' }}>Reset all recorded data?</h3>
              <p className="reset-warning" style={{ marginBottom: '1rem' }}>
                This will permanently delete all daily entries and all archived seasons.
              </p>
              <p className="reset-warning" style={{ marginBottom: '1rem' }}>
                This action does not reinterpret, judge, or summarize anything.<br />
                It simply removes the record.
              </p>
              <p className="completion-tip" style={{ marginBottom: '1rem', color: 'var(--color-text-muted)' }}>
                Once deleted, this evidence cannot be recovered.
              </p>
              <div className="reset-form">
                <label>Type RESET to confirm</label>
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder=""
                />
                <div className="reset-actions">
                  <button
                    className="primary"
                    onClick={handleConfirmReset}
                    disabled={confirmText !== 'RESET'}
                  >
                    Reset everything
                  </button>
                  <button onClick={handleCancel}>Cancel</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      </div>
    </div>
  );
}
