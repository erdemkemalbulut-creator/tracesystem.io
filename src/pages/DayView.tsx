import { useParams } from 'react-router-dom';
import { getDailyEntry } from '../utils/storage';
import { SectionIcon } from '../ui/icons';
import Header from '../components/Header';

export default function DayView() {
  const { day } = useParams<{ day: string }>();
  const dayNumber = parseInt(day || '1', 10);
  const entry = getDailyEntry(dayNumber);

  if (!entry) {
    return (
      <div className="page-with-shell reflective-bg">
        <Header variant="system" />
        <div className="page">
          <div className="today-container">
            <div className="today-header">
              <h1>Day {dayNumber}</h1>
              <p className="completion-tip">This entry is read-only.</p>
            </div>
            <div className="day-locked">
              <p>No entry found for this day.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-with-shell reflective-bg">
      <Header variant="system" />
      <div className="page">
        <div className="today-container day-view-readonly">
          <div className="today-header">
            <h1>Day {dayNumber}</h1>
            <p className="completion-tip">This entry is read-only.</p>
          </div>

          <div className="orientation-section">
            <label className="orientation-prompt" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <SectionIcon name="Awareness" />
              <span>— Awareness —</span>
            </label>
            <p className="readonly-text">{entry.awareness_text}</p>
          </div>

          <div className="action-section">
            <div className="action-item">
              <h3 className="action-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <SectionIcon name="Alignment" />
                <span>— Alignment —</span>
              </h3>
              {entry.alignment_done ? (
                <p className="action-status">Done</p>
              ) : (
                <p className="action-status" style={{ color: 'var(--color-text-muted)' }}></p>
              )}
            </div>

            <div className="action-item">
              <h3 className="action-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <SectionIcon name="Integrity" />
                <span>— Integrity —</span>
              </h3>
              {entry.integrity_done ? (
                <p className="action-status">Done</p>
              ) : (
                <p className="action-status" style={{ color: 'var(--color-text-muted)' }}></p>
              )}
            </div>
          </div>

          <div className="reflection-section">
            <label className="reflection-question" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <SectionIcon name="Reflection" />
              <span>— Reflection —</span>
            </label>
            <p className="readonly-text reflection-readonly">{entry.reflection_text}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
