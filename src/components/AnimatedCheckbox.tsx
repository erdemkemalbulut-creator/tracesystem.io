import { useState } from 'react';
import { Check } from 'lucide-react';

interface AnimatedCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}

export default function AnimatedCheckbox({ checked, onChange, label }: AnimatedCheckboxProps) {
  const [animating, setAnimating] = useState(false);

  const handleToggle = () => {
    const next = !checked;
    if (next) {
      setAnimating(true);
      setTimeout(() => setAnimating(false), 500);
    }
    onChange(next);
  };

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      className={`animated-checkbox ${checked ? 'animated-checkbox--checked' : ''} ${animating ? 'animated-checkbox--animating' : ''}`}
      onClick={handleToggle}
    >
      <span className="animated-checkbox__box">
        {checked && (
          <Check
            size={14}
            strokeWidth={3}
            className="animated-checkbox__icon"
            aria-hidden="true"
          />
        )}
      </span>
      <span className="animated-checkbox__label">{label}</span>
    </button>
  );
}
