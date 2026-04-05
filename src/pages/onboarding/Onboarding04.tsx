import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import StepIndicator from '../../components/StepIndicator';

export default function Onboarding04() {
  const { updateProfile, profile, user } = useAuth();
  const navigate = useNavigate();
  const [justificationSnapshot, setJustificationSnapshot] = useState('');

  useEffect(() => {
    const loadExisting = async () => {
      if (!user) return;
      const { data } = await supabase
        .from('onboarding_data')
        .select('justification_snapshot')
        .eq('user_id', user.id)
        .maybeSingle();

      if (data?.justification_snapshot) {
        setJustificationSnapshot(data.justification_snapshot);
      }
    };
    loadExisting();
  }, [user]);

  const handleNext = async () => {
    if (!justificationSnapshot.trim() || !user) return;

    await supabase
      .from('onboarding_data')
      .upsert({
        user_id: user.id,
        justification_snapshot: justificationSnapshot,
      }, { onConflict: 'user_id' });

    if (profile && profile.onboarding_step < 4) {
      await updateProfile({ onboarding_step: 4 });
    }
    navigate('/onboarding/05');
  };

  const examples = [
    "I'll do it when things calm down.",
    "I need to be ready first.",
    "Now isn't the right time."
  ];

  return (
    <div className="page">
      <button
        onClick={() => navigate('/onboarding/03')}
        className="back-link"
        style={{ marginBottom: '2rem' }}
      >
        ← Back
      </button>
      <div className="onboarding-screen">
        <StepIndicator current={4} total={7} />
        <div className="onboarding-prompt">
          <label>What do you usually tell yourself to explain this delay?</label>
          <textarea
            value={justificationSnapshot}
            onChange={(e) => setJustificationSnapshot(e.target.value)}
            rows={5}
            placeholder=""
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
            {examples.map((example, i) => (
              <p key={i} className="helper-text" style={{ margin: 0, opacity: 0.6 }}>
                {example}
              </p>
            ))}
          </div>
          <p className="helper-text">This isn't about truth. It's about repetition.</p>
        </div>
        <button
          className="primary"
          onClick={handleNext}
          disabled={!justificationSnapshot.trim()}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
