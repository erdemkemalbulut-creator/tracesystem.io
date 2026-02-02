export const QUESTION_BANK = [
  'What did I avoid today that I knew mattered?',
  'What did my behavior optimize for today?',
  'Where did I choose comfort over alignment?',
  'What did I say I cared about — and did my actions agree?',
  'What was the smallest moment I compromised?',
  'Where did I act out of habit rather than choice?',
  'What pattern am I starting to notice?',
  'What excuse did I use today?',
  'If someone watched today on video, what would they think I value?',
  'Where did I overcomplicate something simple?',
  'What did I already know but pretend not to?',
  'What did I do to protect an identity rather than tell the truth?',
  'What would "alignment" have looked like today?',
  'What am I learning about myself?',
  'Where did I do what I said I would — even when it was inconvenient?',
  'Where did I break a promise to myself?',
  'What did I finish today?',
  'What am I consistently putting off — and why?',
  'Where did I act differently than my past self?',
  'What would tomorrow look like if I respected my word?',
  'What is becoming easier?',
  'What no longer requires willpower?',
  'What still feels resistant?',
  'What would "drift" look like for me?',
  'What would alignment look like next month?',
  'What am I no longer willing to tolerate?',
  'What did this season change?',
  'What stayed the same — and why?',
  'Who am I becoming if I keep this up?',
  'What deserves my next season of effort?',
];

export const getQuestionForDay = (dayNumber: number): string => {
  const index = ((dayNumber - 1) % 30);
  return QUESTION_BANK[index];
};
