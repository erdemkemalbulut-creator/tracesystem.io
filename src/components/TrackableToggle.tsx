import { useState } from 'react';

interface TrackableToggleProps {
  emoji: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export default function TrackableToggle({ emoji, label, checked, onChange }: TrackableToggleProps) {
  const [animating, setAnimating] = useState(false);

  const handleClick = () => {
    const next = !checked;
    onChange(next);
    if (next) {
      setAnimating(true);
      setTimeout(() => setAnimating(false), 400);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`trackable-toggle ${checked ? 'trackable-toggle--active' : ''} ${animating ? 'trackable-toggle--pop' : ''}`}
      role="checkbox"
      aria-checked={checked}
    >
      <span className="trackable-toggle__emoji">{emoji}</span>
      <span className="trackable-toggle__label">{label}</span>
    </button>
  );
}
