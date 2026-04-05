interface TrendChartProps {
  data: { day: number; alignment: boolean; integrity: boolean }[];
}

export default function TrendChart({ data }: TrendChartProps) {
  const width = 320;
  const height = 140;
  const padding = { top: 12, right: 12, bottom: 24, left: 28 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  // Cumulative counts
  let alignCount = 0;
  let integrityCount = 0;
  const alignPoints: string[] = [];
  const integrityPoints: string[] = [];
  const maxDay = Math.max(data.length, 1);
  const maxVal = data.reduce((acc, d) => acc + (d.alignment ? 1 : 0) + (d.integrity ? 1 : 0), 0) || 1;

  for (const d of data) {
    if (d.alignment) alignCount++;
    if (d.integrity) integrityCount++;

    const x = padding.left + ((d.day - 1) / (maxDay - 1 || 1)) * chartW;
    const yA = padding.top + chartH - (alignCount / maxVal) * chartH;
    const yI = padding.top + chartH - (integrityCount / maxVal) * chartH;

    alignPoints.push(`${x},${yA}`);
    integrityPoints.push(`${x},${yI}`);
  }

  if (data.length === 0) {
    return (
      <div className="trend-chart glass-card" style={{ textAlign: 'center', padding: '2rem' }}>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
          No entries yet. Start recording to see trends.
        </p>
      </div>
    );
  }

  return (
    <div className="trend-chart">
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" preserveAspectRatio="xMidYMid meet">
        <defs>
          <filter id="glow-blue">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <filter id="glow-purple">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((pct) => {
          const y = padding.top + chartH * (1 - pct);
          return (
            <line
              key={pct}
              x1={padding.left}
              y1={y}
              x2={width - padding.right}
              y2={y}
              stroke="var(--color-border)"
              strokeWidth="0.5"
              strokeDasharray="2 4"
            />
          );
        })}

        {/* Alignment line */}
        <polyline
          points={alignPoints.join(' ')}
          fill="none"
          stroke="var(--color-accent-blue)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#glow-blue)"
        />

        {/* Integrity line */}
        <polyline
          points={integrityPoints.join(' ')}
          fill="none"
          stroke="var(--color-accent-purple)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#glow-purple)"
        />

        {/* X axis label */}
        <text x={padding.left} y={height - 4} fontSize="9" fill="var(--color-text-subtle)">Day 1</text>
        <text x={width - padding.right} y={height - 4} fontSize="9" fill="var(--color-text-subtle)" textAnchor="end">Day {maxDay}</text>
      </svg>

      <div className="trend-chart__legend">
        <span className="trend-chart__legend-item">
          <span className="trend-chart__legend-dot" style={{ background: 'var(--color-accent-blue)' }} />
          Alignment ({alignCount})
        </span>
        <span className="trend-chart__legend-item">
          <span className="trend-chart__legend-dot" style={{ background: 'var(--color-accent-purple)' }} />
          Integrity ({integrityCount})
        </span>
      </div>
    </div>
  );
}
