import { Feedback } from '../models/Feedback';
import { Report } from '../models/Report';

const DEMO_SLUG = 'demo';
const DEMO_USER_ID = '__demo__';

const DEMO_FEEDBACK = [
  {
    rawText: 'Love the new dashboard layout — so much cleaner than the old one. The charts make it really easy to see trends at a glance.',
    sentiment: 'positive' as const,
    category: 'UX',
    summary: 'User praises the new dashboard layout and chart clarity.',
    confidence: 0.95,
  },
  {
    rawText: 'The CSV batch upload saved me hours of manual tagging. Brilliant addition.',
    sentiment: 'positive' as const,
    category: 'Feature Request',
    summary: 'CSV upload feature praised for saving manual effort.',
    confidence: 0.92,
  },
  {
    rawText: 'Cannot log in with my Google account — keeps redirecting back to the sign-in page.',
    sentiment: 'negative' as const,
    category: 'Bug Report',
    summary: 'Google OAuth sign-in stuck in a redirect loop.',
    confidence: 0.97,
  },
  {
    rawText: 'Dashboard loads slowly once I have more than 100 entries. Pagination would help a lot.',
    sentiment: 'negative' as const,
    category: 'Performance',
    summary: 'Dashboard performance degrades past 100 entries.',
    confidence: 0.89,
  },
  {
    rawText: 'Would love to see a Slack integration so new feedback shows up in our team channel.',
    sentiment: 'neutral' as const,
    category: 'Feature Request',
    summary: 'Requests a Slack integration for new feedback alerts.',
    confidence: 0.85,
  },
  {
    rawText: 'Billing was charged twice this month — please refund the duplicate.',
    sentiment: 'negative' as const,
    category: 'Billing',
    summary: 'Customer reports a duplicate charge and requests a refund.',
    confidence: 0.98,
  },
  {
    rawText: 'Customer support resolved my issue in under 10 minutes. Great team!',
    sentiment: 'positive' as const,
    category: 'Support',
    summary: 'Support team praised for fast issue resolution.',
    confidence: 0.96,
  },
  {
    rawText: 'The sentiment classifier mislabels sarcasm fairly often — flagged a clearly positive note as negative.',
    sentiment: 'negative' as const,
    category: 'Bug Report',
    summary: 'Sentiment classifier struggles with sarcasm.',
    confidence: 0.78,
  },
  {
    rawText: 'Pricing feels fair for what you get. No complaints from our team.',
    sentiment: 'neutral' as const,
    category: 'Billing',
    summary: 'Customer finds the pricing reasonable.',
    confidence: 0.82,
  },
  {
    rawText: 'Dark mode looks fantastic and is much easier on the eyes during late-night sessions.',
    sentiment: 'positive' as const,
    category: 'UX',
    summary: 'User appreciates the dark mode design for late-night use.',
    confidence: 0.93,
  },
];

/**
 * Idempotently seeds a public demo report at `/report/demo` so unauthenticated
 * visitors landing from the marketing page have something realistic to view.
 *
 * Creates 10 hand-curated `Feedback` documents owned by a synthetic `__demo__`
 * userId plus a `Report` with slug `demo` that references them. Skips entirely
 * when the report already exists, so it's safe to call on every server boot.
 */
export async function seedDemoReport(): Promise<void> {
  const existing = await Report.findOne({ slug: DEMO_SLUG });
  if (existing) return;

  await Feedback.deleteMany({ userId: DEMO_USER_ID });

  const now = new Date();
  const docs = await Feedback.insertMany(
    DEMO_FEEDBACK.map((f) => ({
      ...f,
      userId: DEMO_USER_ID,
      source: 'manual' as const,
      analyzedAt: now,
    }))
  );

  await Report.create({
    title: 'Customer Feedback Demo — Sample Insights',
    slug: DEMO_SLUG,
    feedbackIds: docs.map((d) => d._id),
  });

  console.log(`Seeded demo report at /report/${DEMO_SLUG} with ${docs.length} entries`);
}
