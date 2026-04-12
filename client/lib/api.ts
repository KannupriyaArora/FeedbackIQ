const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export interface Feedback {
  _id: string;
  rawText: string;
  source: 'manual' | 'csv';
  sentiment: 'positive' | 'negative' | 'neutral' | null;
  category: string | null;
  createdAt: string;
}

export async function postFeedback(rawText: string, source: 'manual' | 'csv'): Promise<Feedback> {
  const res = await fetch(`${BASE_URL}/api/feedback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rawText, source }),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.errors?.[0]?.msg || 'Failed to submit feedback');
  }
  return res.json();
}

export async function getFeedback(source?: string): Promise<Feedback[]> {
  const url = new URL(`${BASE_URL}/api/feedback`);
  if (source) url.searchParams.set('source', source);
  const res = await fetch(url.toString(), { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch feedback');
  return res.json();
}
