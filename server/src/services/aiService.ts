import Groq from 'groq-sdk';

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

export interface AnalysisResult {
  sentiment: 'positive' | 'negative' | 'neutral';
  category: string;
  summary: string;
  confidence: number;
}

const FALLBACK: AnalysisResult = {
  sentiment: 'neutral',
  category: 'Uncategorized',
  summary: 'Analysis unavailable.',
  confidence: 0,
};

const SYSTEM_PROMPT = `You are a feedback analysis assistant. Analyse the user feedback provided and respond ONLY with a valid JSON object — no markdown, no explanation, no code fences.

The JSON must have exactly these fields:
{
  "sentiment": "positive" | "negative" | "neutral",
  "category": string,   // one of: "Billing", "Support", "UX", "Performance", "Feature Request", "Bug Report", "General"
  "summary": string,    // one sentence, max 20 words
  "confidence": number  // float between 0 and 1
}`;

export async function analyzeFeedback(text: string): Promise<AnalysisResult> {
  try {
    const completion = await client.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      max_tokens: 256,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `Feedback: ${text}` },
      ],
    });

    const raw = completion.choices[0]?.message?.content?.trim() ?? '';
    const parsed = JSON.parse(raw) as AnalysisResult;

    const validSentiments = ['positive', 'negative', 'neutral'];
    if (
      !validSentiments.includes(parsed.sentiment) ||
      typeof parsed.category !== 'string' ||
      typeof parsed.summary !== 'string' ||
      typeof parsed.confidence !== 'number'
    ) {
      return FALLBACK;
    }

    return parsed;
  } catch (err) {
    console.error('analyzeFeedback error:', err);
    return FALLBACK;
  }
}
