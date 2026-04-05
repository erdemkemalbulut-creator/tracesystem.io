interface ProgressRingProps {
  current: number;
  total: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
}

export default function ProgressRing({
  current,
  total,
  size = 120,
  strokeWidth = 5,
  label,
}: ProgressRingProps) {
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(current / total, 1);
  const offset = circumference * (1 - progress);

  return (
    <div className="progress-ring" style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
        <defs>
          <linearGradient id="ring-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--color-accent-blue)" />
            <stop offset="100%" stopColor="var(--color-accent-purple)" />
          </linearGradient>
        </defs>
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--color-border)"
          strokeWidth={strokeWidth}
        />
        {/* Foreground arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#ring-gradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          className="progress-ring__fill"
          style={{
            '--ring-circumference': circumference,
            '--ring-offset': offset,
          } as React.CSSProperties}
        />
      </svg>
      <div className="progress-ring__label">
        <span className="progress-ring__value">{current}</span>
        <span className="progress-ring__caption">{label ?? `/ ${total}`}</span>
      </div>
    </div>
  );
}
