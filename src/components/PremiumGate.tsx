import type { ReactNode } from 'react';
import { Lock } from 'lucide-react';

interface PremiumGateProps {
  isPremium: boolean;
  children: ReactNode;
  featureName: string;
}

export default function PremiumGate({ isPremium, children, featureName }: PremiumGateProps) {
  if (isPremium) {
    return <>{children}</>;
  }

  return (
    <div className="premium-gate">
      <div className="premium-gate__content">
        {children}
      </div>
      <div className="premium-gate__overlay">
        <div className="premium-gate__card glass-card glass-elevated">
          <Lock size={20} aria-hidden="true" />
          <p className="premium-gate__title">{featureName}</p>
          <p className="premium-gate__desc">Available with Premium</p>
          <button className="primary" disabled>Coming soon</button>
        </div>
      </div>
    </div>
  );
}
