import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { captureError } from '../lib/sentry';

type ReflectionStep = 'intro' | 'question1' | 'question2' | 'question3' | 'complete';

export default function WeekReflection() {
  const [step, setStep] = useState<ReflectionStep>('intro');
  const [answer1, setAnswer1] = useState('');
  const [answer2, setAnswer2] = useState('');
  const [answer3, setAnswer3] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const checkIfDue = async () => {
      if (!user) return;

      const { data: season } = await supabase
        .from('seasons')
        .select('id, start_date')
        .eq('user_id', user.id)
        .is('end_date', null)
        .maybeSingle();

      if (!season) {
        navigate('/today');
        return;
      }

      const daysSinceStart = Math.floor(
        (Date.now() - new Date(season.start_date).getTime()) / (1000 * 60 * 60 * 24)
      );
      const currentDay = daysSinceStart + 1;
      const weekNumber = Math.floor((currentDay - 1) / 7) + 1;

      if (currentDay < 7 || weekNumber > 4) {
        navigate('/today');
        return;
      }

      const { data: existing } = await supabase
        .from('weekly_reflections')
        .select('id')
        .eq('user_id', user.id)
        .eq('season_id', season.id)
        .eq('week_number', weekNumber)
        .maybeSingle();

      if (existing) {
        navigate('/today');
      }
    };

    checkIfDue();
  }, [user, navigate]);

  const handleIntro = () => {
    setStep('question1');
  };

  const handleQuestion1 = () => {
    if (!answer1.trim()) return;
    setStep('question2');
  };

  const handleQuestion2 = () => {
    if (!answer2.trim()) return;
    setStep('question3');
  };

  const handleQuestion3 = async () => {
    if (!answer3.trim() || !user) return;
    setLoading(true);

    try {
      const { data: season } = await supabase
        .from('seasons')
        .select('id, start_date')
        .eq('user_id', user.id)
        .is('end_date', null)
        .maybeSingle();

      if (!season) return;

      const daysSinceStart = Math.floor(
        (Date.now() - new Date(season.start_date).getTime()) / (1000 * 60 * 60 * 24)
      );
      const currentDay = daysSinceStart + 1;
      const weekNumber = Math.floor((currentDay - 1) / 7) + 1;

      const weekStartDay = (weekNumber - 1) * 7 + 1;
      const weekEndDay = Math.min(weekNumber * 7, currentDay);

      const startDate = new Date(season.start_date);
      startDate.setDate(startDate.getDate() + weekStartDay - 1);

      const endDate = new Date(season.start_date);
      endDate.setDate(endDate.getDate() + weekEndDay - 1);

      await supabase.from('weekly_reflections').insert({
        user_id: user.id,
        season_id: season.id,
        week_number: weekNumber,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        answer1_text: answer1,
        answer2_text: answer2,
        answer3_text: answer3,
      });

      setStep('complete');
    } catch (error) {
      captureError(error, 'saveWeeklyReflection');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = () => {
    navigate('/today');
  };

  if (step === 'intro') {
    return (
      <div className="page">
        <div className="week-reflection-screen">
          <h1>Before you continue.</h1>
          <div className="week-reflection-body">
            <p>You've recorded a full week.</p>
            <p>
              Before moving forward, the system asks you to pause
              <br />
              and look at what actually happened —
              <br />
              not what you hoped would happen.
            </p>
          </div>
          <button className="primary" onClick={handleIntro}>
            Review the week
          </button>
        </div>
      </div>
    );
  }

  if (step === 'question1') {
    return (
      <div className="page">
        <div className="week-reflection-screen">
          <h1>What did this week actually optimize for?</h1>
          <div className="week-reflection-prompt">
            <p className="prompt-text">
              Look across your actions, not your intentions.
            </p>
            <p className="prompt-text">
              What did your behavior consistently protect, prioritize, or avoid this week?
            </p>
            <p className="helper-text">One or two sentences is enough. Be concrete.</p>
            <textarea
              value={answer1}
              onChange={(e) => setAnswer1(e.target.value)}
              rows={5}
              placeholder=""
            />
          </div>
          <button
            className="primary"
            onClick={handleQuestion1}
            disabled={!answer1.trim()}
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  if (step === 'question2') {
    return (
      <div className="page">
        <div className="week-reflection-screen">
          <h1>What surprised you?</h1>
          <div className="week-reflection-prompt">
            <p className="prompt-text">
              What did you notice this week that you didn't expect
              <br />
              about your behavior, resistance, or follow-through?
            </p>
            <p className="helper-text">This is not a judgment. It's an observation.</p>
            <textarea
              value={answer2}
              onChange={(e) => setAnswer2(e.target.value)}
              rows={5}
              placeholder=""
            />
          </div>
          <button
            className="primary"
            onClick={handleQuestion2}
            disabled={!answer2.trim()}
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  if (step === 'question3') {
    return (
      <div className="page">
        <div className="week-reflection-screen">
          <h1>What pattern feels most true right now?</h1>
          <div className="week-reflection-prompt">
            <p className="prompt-text">
              If you had to name the dominant pattern of this week,
              <br />
              what would it be?
            </p>
            <textarea
              value={answer3}
              onChange={(e) => setAnswer3(e.target.value)}
              rows={5}
              placeholder=""
            />
          </div>
          <button
            className="primary"
            onClick={handleQuestion3}
            disabled={!answer3.trim() || loading}
          >
            {loading ? 'Saving...' : 'Continue'}
          </button>
        </div>
      </div>
    );
  }

  if (step === 'complete') {
    return (
      <div className="page">
        <div className="week-reflection-screen">
          <h1>Noted.</h1>
          <div className="week-reflection-body">
            <p>Nothing needs to change.</p>
            <p>But something is now harder to ignore.</p>
            <p className="completion-subtext">You can continue.</p>
          </div>
          <button className="primary" onClick={handleComplete}>
            Return to today
          </button>
        </div>
      </div>
    );
  }

  return null;
}
