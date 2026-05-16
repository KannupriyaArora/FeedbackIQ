import Groq from 'groq-sdk';

let _client: Groq | null = null;

/**
 * Returns a lazily-initialised Groq SDK client.
 * Returns null when `GROQ_API_KEY` is not set so callers can fall back gracefully.
 */
function getClient(): Groq | null {
  if (!process.env.GROQ_API_KEY) return null;
  if (!_client) _client = new Groq({ apiKey: process.env.GROQ_API_KEY });
  return _client;
}

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

/**
 * Type guard that validates an unknown value matches the `AnalysisResult` shape.
 */
function isValidAnalysis(value: unknown): value is AnalysisResult {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return (
    (v.sentiment === 'positive' || v.sentiment === 'negative' || v.sentiment === 'neutral') &&
    typeof v.category === 'string' &&
    typeof v.summary === 'string' &&
    typeof v.confidence === 'number'
  );
}

/**
 * Calls the Groq chat completion endpoint once and parses the JSON response.
 * Throws on any error (network, JSON parse, shape validation) so the caller can retry.
 */
async function callGroq(client: Groq, text: string): Promise<AnalysisResult> {
  const completion = await client.chat.completions.create({
    model: 'llama-3.1-8b-instant',
    max_tokens: 256,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: `Feedback: ${text}` },
    ],
  });

  const raw = completion.choices[0]?.message?.content?.trim() ?? '';
  const parsed = JSON.parse(raw) as unknown;

  if (!isValidAnalysis(parsed)) {
    throw new Error('Groq returned an invalid analysis shape');
  }
  return parsed;
}

/**
 * Analyses a piece of feedback using the Groq LLM and returns sentiment, category,
 * a one-line summary, and a confidence score.
 *
 * Retries the upstream call once on failure (transient network errors, malformed
 * JSON, rate limits). If the second attempt also fails, returns a neutral fallback
 * so callers never have to handle a thrown error — the feedback is still persisted
 * with sentiment `neutral` and can be reanalysed later.
 *
 * @param text The raw feedback text to analyse.
 * @returns A structured analysis result, or the neutral fallback on failure.
 */
export async function analyzeFeedback(text: string): Promise<AnalysisResult> {
  const client = getClient();
  if (!client) {
    console.error('analyzeFeedback: GROQ_API_KEY is not set');
    return FALLBACK;
  }

  try {
    return await callGroq(client, text);
  } catch (firstErr) {
    console.warn('analyzeFeedback: first attempt failed, retrying…', firstErr);
    try {
      return await callGroq(client, text);
    } catch (secondErr) {
      console.error('analyzeFeedback: retry failed, returning fallback', secondErr);
      return FALLBACK;
    }
  }
}
