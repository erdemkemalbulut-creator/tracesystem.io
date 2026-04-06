import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import PageTransition from '../components/PageTransition';
import { useTrackables } from '../hooks/useTrackables';
import { X, Plus } from 'lucide-react';

const SUGGESTED_TRACKABLES = [
  { emoji: '💬', label: 'Had the hard conversation' },
  { emoji: '📵', label: 'Avoided doomscrolling' },
  { emoji: '🌅', label: 'Kept morning routine' },
  { emoji: '🏃', label: 'Moved my body' },
  { emoji: '🤝', label: 'Kept a promise to myself' },
  { emoji: '📝', label: 'Did focused deep work' },
  { emoji: '🧘', label: 'Stayed present' },
  { emoji: '🚫', label: 'Said no when I needed to' },
];

export default function ManageTrackables() {
  const navigate = useNavigate();
  const { trackables, addTrackable, removeTrackable, loading } = useTrackables();
  const [newLabel, setNewLabel] = useState('');
  const [newEmoji, setNewEmoji] = useState('✓');
  const [adding, setAdding] = useState(false);

  const existingLabels = new Set(trackables.map(t => t.label.toLowerCase()));
  const suggestions = SUGGESTED_TRACKABLES.filter(
    s => !existingLabels.has(s.label.toLowerCase())
  );

  const handleAdd = async () => {
    if (!newLabel.trim()) return;
    setAdding(true);
    await addTrackable(newLabel.trim(), newEmoji);
    setNewLabel('');
    setNewEmoji('✓');
    setAdding(false);
  };

  const handleAddSuggested = async (emoji: string, label: string) => {
    await addTrackable(label, emoji);
  };

  const handleRemove = async (id: string) => {
    await removeTrackable(id);
  };

  if (loading) {
    return (
      <div className="page-with-shell reflective-bg">
        <Header variant="system" />
        <div className="page">
          <p className="meta-text">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-with-shell reflective-bg">
      <Header variant="system" />
      <PageTransition>
      <div className="page">
        <div className="today-container">
          <div className="today-header" style={{ alignItems: 'flex-start', textAlign: 'left' }}>
            <h1>Your behaviors</h1>
            <p className="meta-text">
              Define what matters to you. These show up as quick toggles in your daily check-in.
            </p>
          </div>

          {/* Current trackables */}
          {trackables.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {trackables.map(t => (
                <div
                  key={t.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    border: '1px solid var(--color-border)',
                    background: 'var(--color-bg-tertiary)',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9375rem' }}>
                    <span>{t.emoji}</span>
                    <span style={{ color: 'var(--color-text-primary)' }}>{t.label}</span>
                  </span>
                  <button
                    onClick={() => handleRemove(t.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--color-text-subtle)',
                      padding: '4px',
                      display: 'flex',
                    }}
                    aria-label={`Remove ${t.label}`}
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add custom */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <label className="orientation-prompt" style={{ fontSize: '0.875rem' }}>
              Add a behavior
            </label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                value={newEmoji}
                onChange={(e) => setNewEmoji(e.target.value)}
                style={{ width: '48px', textAlign: 'center', fontSize: '1.25rem' }}
                maxLength={2}
              />
              <input
                type="text"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                placeholder="e.g. Stayed off social media"
                style={{ flex: 1 }}
              />
              <button
                className="primary"
                onClick={handleAdd}
                disabled={!newLabel.trim() || adding}
                style={{ padding: '0.5rem 1rem', whiteSpace: 'nowrap' }}
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <label className="orientation-prompt" style={{ fontSize: '0.875rem' }}>
                Suggestions
              </label>
              <div className="trackables-grid">
                {suggestions.map(s => (
                  <button
                    key={s.label}
                    onClick={() => handleAddSuggested(s.emoji, s.label)}
                    className="trackable-toggle"
                    style={{ cursor: 'pointer' }}
                  >
                    <span className="trackable-toggle__emoji">{s.emoji}</span>
                    <span className="trackable-toggle__label">{s.label}</span>
                    <Plus size={12} style={{ marginLeft: '0.25rem', opacity: 0.5 }} />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Back */}
          <button
            onClick={() => navigate('/today')}
            className="primary"
            style={{ marginTop: '1rem' }}
          >
            Back to check-in
          </button>
        </div>
      </div>
      </PageTransition>
    </div>
  );
}
