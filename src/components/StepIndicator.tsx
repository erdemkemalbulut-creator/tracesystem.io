interface StepIndicatorProps {
  current: number;
  total: number;
}

export default function StepIndicator({ current, total }: StepIndicatorProps) {
  return (
    <div className="step-indicator" role="progressbar" aria-valuenow={current} aria-valuemin={1} aria-valuemax={total}>
      {Array.from({ length: total }, (_, i) => {
        const step = i + 1;
        let cls = 'step-indicator__dot';
        if (step < current) cls += ' step-indicator__dot--completed';
        else if (step === current) cls += ' step-indicator__dot--current';
        return <div key={step} className={cls} />;
      })}
    </div>
  );
}
