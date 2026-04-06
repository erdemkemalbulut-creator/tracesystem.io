import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'authorization, content-type');
    return res.status(200).end();
  }

  res.setHeader('Access-Control-Allow-Origin', '*');

  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'No auth header' });
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return res.status(500).json({ error: 'Supabase not configured' });
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } },
  });

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const today = new Date().toISOString().split('T')[0];

  // Check cache
  const { data: existing } = await supabase
    .from('daily_ai_questions')
    .select('question_text')
    .eq('user_id', user.id)
    .eq('question_date', today)
    .maybeSingle();

  if (existing) {
    return res.json({ question: existing.question_text });
  }

  // Fetch recent entries
  const { data: season } = await supabase
    .from('seasons')
    .select('id')
    .eq('user_id', user.id)
    .eq('is_closed', false)
    .order('start_date', { ascending: false })
    .maybeSingle();

  let context = '';

  if (season) {
    const { data: entries } = await supabase
      .from('daily_entries')
      .select('day_number, orientation_text, ai_question_text, ai_question_answer, reflection_text, alignment_done, integrity_done')
      .eq('user_id', user.id)
      .eq('season_id', season.id)
      .order('day_number', { ascending: false })
      .limit(7);

    const { data: trackables } = await supabase
      .from('user_trackables')
      .select('id, label, emoji')
      .eq('user_id', user.id)
      .eq('active', true);

    let trackableContext = '';
    if (trackables && trackables.length > 0) {
      const trackableIds = trackables.map(t => t.id);
      const { data: completions } = await supabase
        .from('daily_trackable_entries')
        .select('trackable_id, completed, recorded_date')
        .in('trackable_id', trackableIds)
        .order('recorded_date', { ascending: false })
        .limit(trackables.length * 7);

      const trackableSummary = trackables.map(t => {
        const recent = (completions || []).filter(c => c.trackable_id === t.id);
        const completed = recent.filter(c => c.completed).length;
        const total = recent.length;
        return `- ${t.emoji} "${t.label}": completed ${completed}/${total} recent days`;
      });

      trackableContext = `\nUser's tracked behaviors:\n${trackableSummary.join('\n')}`;
    }

    if (entries && entries.length > 0) {
      const entrySummaries = entries.map(e => {
        const parts = [`Day ${e.day_number}:`];
        if (e.ai_question_answer) parts.push(`Answer: "${e.ai_question_answer}"`);
        else if (e.orientation_text) parts.push(`Awareness: "${e.orientation_text}"`);
        if (e.reflection_text) parts.push(`Reflection: "${e.reflection_text}"`);
        return parts.join(' ');
      });

      context = `Recent entries:\n${entrySummaries.join('\n')}${trackableContext}`;
    } else {
      context = `This is the user's first or second day. No past entries yet.${trackableContext}`;
    }
  }

  // Call OpenAI
  const openaiKey = process.env.OPENAI_API_KEY;
  if (!openaiKey) {
    return res.status(500).json({ error: 'OpenAI not configured' });
  }

  const systemPrompt = `You are the AI engine behind Trace, a behavioral awareness system. Your job is to generate ONE short, incisive question for the user's daily check-in.

Rules:
- The question should be personal and specific to their patterns, not generic
- Reference specific behaviors, patterns, or contradictions you notice in their recent data
- Keep it under 20 words
- Be direct, not preachy. Think "sharp friend", not therapist
- Don't repeat questions they've already been asked recently
- If they keep avoiding or skipping the same tracked behavior, ask about it
- If they're on a streak, acknowledge it and push deeper
- Never use emojis in the question`;

  const userPrompt = context
    ? `Based on this user's recent data, generate one personalized daily question:\n\n${context}`
    : `Generate a thoughtful first-day question for a new user of a behavioral tracking system.`;

  try {
    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: 60,
        temperature: 0.8,
      }),
    });

    const openaiData = await openaiRes.json();
    const question = openaiData.choices?.[0]?.message?.content?.trim() || 'What did you avoid today that you knew mattered?';

    // Cache the question
    await supabase.from('daily_ai_questions').insert({
      user_id: user.id,
      question_text: question,
      question_date: today,
    });

    return res.json({ question });
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
}
