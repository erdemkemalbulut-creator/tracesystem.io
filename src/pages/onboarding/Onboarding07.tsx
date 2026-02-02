import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

export default function Onboarding07() {
  const { updateProfile, user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [hasConsent, setHasConsent] = useState(false);

  useEffect(() => {
    const checkConsent = async () => {
      if (!user) return;

      const { data } = await supabase
        .from('onboarding_data')
        .select('consent')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!data || !data.consent) {
        navigate('/onboarding/06');
        return;
      }

      setHasConsent(true);
      setLoading(false);
    };

    checkConsent();
  }, [user, navigate]);

  const handleBegin = async () => {
    if (!user || !hasConsent) return;

    await supabase
      .from('onboarding_data')
      .upsert({
        user_id: user.id,
        season_declaration_ack: true,
      }, { onConflict: 'user_id' });

    await supabase
      .from('seasons')
      .insert({
        user_id: user.id,
        start_date: new Date().toISOString(),
      });

    await updateProfile({
      onboarding_step: 7,
      onboarding_complete: true,
    });

    navigate('/today');
  };

  if (loading) {
    return (
      <div className="page">
        <div className="onboarding-screen">
          <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <button
        onClick={() => navigate('/onboarding/06')}
        className="back-link"
        style={{ marginBottom: '2rem' }}
      >
        ← Back
      </button>
      <div className="onboarding-screen">
        <h1>This is the season you're entering.</h1>
        <div className="onboarding-statement">
          <p className="statement">
            I am someone who pays attention to my actions — even when it's uncomfortable.
          </p>
          <div className="subtext">
            <p>You're not claiming this is true yet.</p>
            <p>You're choosing to practice it.</p>
          </div>
        </div>
        <button className="primary" onClick={handleBegin}>
          Accept and begin
        </button>
      </div>
    </div>
  );
}
