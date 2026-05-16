import { useUser } from '@clerk/nextjs';

type ClerkUser = NonNullable<ReturnType<typeof useUser>['user']>;
type ClerkExternalAccount = ClerkUser['externalAccounts'][number];

export const PROVIDER_KEY = 'feedbackiq:lastProvider';
export const META_KEY = 'lastSignInProvider';

const PROVIDER_LABELS: Record<string, string> = {
  google: 'Google',
  github: 'GitHub',
};

export interface ProviderProfile {
  providerLabel: string;
  imageUrl: string;
  displayName: string;
  email: string;
  username?: string;
}

export function readStoredProvider(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(PROVIDER_KEY);
}

export function readMetaProvider(user: ClerkUser): string | null {
  const meta = user.unsafeMetadata as Record<string, unknown> | undefined;
  const value = meta?.[META_KEY];
  return typeof value === 'string' ? value : null;
}

function normalizeProvider(value: string | null): string | null {
  if (!value) return null;
  return value.replace(/^oauth_/, '');
}

function prettyProvider(provider: string): string {
  const slug = normalizeProvider(provider) ?? provider;
  if (PROVIDER_LABELS[slug]) return PROVIDER_LABELS[slug];
  return slug.replace(/^\w/, (c) => c.toUpperCase());
}

function pickActiveExternalAccount(
  user: ClerkUser,
  trackedProvider: string | null
): ClerkExternalAccount | null {
  const all = user.externalAccounts;
  if (all.length === 0) return null;

  const trackedSlug = normalizeProvider(trackedProvider);
  if (trackedSlug) {
    const match = all.find(
      (a: ClerkExternalAccount) => normalizeProvider(a.provider) === trackedSlug
    );
    if (match) return match;
  }

  const verified = user.verifiedExternalAccounts;
  if (verified.length === 1) return verified[0];
  if (verified.length === 0 && all.length === 1) return all[0];

  const linkedId = user.primaryEmailAddress?.linkedTo?.[0]?.id;
  if (linkedId) {
    const match = all.find((a: ClerkExternalAccount) => a.id === linkedId);
    if (match) return match;
  }

  return verified[0] ?? all[0];
}

export function buildProfile(user: ClerkUser, trackedProvider: string | null): ProviderProfile {
  const active = pickActiveExternalAccount(user, trackedProvider);

  if (active) {
    const fullName = [active.firstName, active.lastName].filter(Boolean).join(' ').trim();
    return {
      providerLabel: prettyProvider(active.provider),
      imageUrl: active.imageUrl || user.imageUrl,
      displayName: fullName || active.username || active.emailAddress,
      email: active.emailAddress,
      username: active.username,
    };
  }

  return {
    providerLabel: 'Account',
    imageUrl: user.imageUrl,
    displayName: user.fullName || user.username || user.primaryEmailAddress?.emailAddress || 'User',
    email: user.primaryEmailAddress?.emailAddress ?? '',
    username: user.username ?? undefined,
  };
}
