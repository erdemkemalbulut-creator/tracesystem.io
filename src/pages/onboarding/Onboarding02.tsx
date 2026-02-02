import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

export default function Onboarding02() {
  const { updateProfile, profile, user } = useAuth();
  const navigate = useNavigate();
  const [frictionArea, setFrictionArea] = useState('');

  useEffect(() => {
    const loadExisting = async () => {
      if (!user) return;
      const { data } = await supabase
        .from('onboarding_data')
        .select('friction_area')
        .eq('user_id', user.id)
        .maybeSingle();

      if (data?.friction_area) {
        setFrictionArea(data.friction_area);
      }
    };
    loadExisting();
  }, [user]);

  const handleNext = async () => {
    if (!frictionArea || !user) return;

    await supabase
      .from('onboarding_data')
      .upsert({
        user_id: user.id,
        friction_area: frictionArea,
      }, { onConflict: 'user_id' });

    if (profile && profile.onboarding_step < 2) {
      await updateProfile({ onboarding_step: 2 });
    }
    navigate('/onboarding/03');
  };

  const options = [
    'Work',
    'Health',
    'Relationships',
    'Money',
    'Direction',
    'Something else'
  ];

  return (
    <div className="page">
      <button
        onClick={() => navigate('/onboarding/01')}
        className="back-link"
        style={{ marginBottom: '2rem' }}
      >
        ← Back
      </button>
      <div className="onboarding-screen">
        <div className="onboarding-prompt">
          <label>Which area of your life feels heavier than it should?</label>
          <div className="button-group" style={{ flexDirection: 'column', gap: '0.75rem' }}>
            {options.map((option) => (
              <button
                key={option}
                className={frictionArea === option ? 'primary' : ''}
                onClick={() => setFrictionArea(option)}
              >
                {option}
              </button>
            ))}
          </div>
          <p className="helper-text">This isn't a diagnosis. It's a reference point.</p>
        </div>
        <button
          className="primary"
          onClick={handleNext}
          disabled={!frictionArea}
          style={{ marginTop: '1rem' }}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
