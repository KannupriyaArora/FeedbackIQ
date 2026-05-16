'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useClerk, useUser } from '@clerk/nextjs';
import {
  buildProfile,
  PROVIDER_KEY,
  readMetaProvider,
  readStoredProvider,
  META_KEY,
} from '../lib/clerkProvider';

export default function UserMenu() {
  const { user, isLoaded } = useUser();
  const { openUserProfile, signOut } = useClerk();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [trackedProvider, setTrackedProvider] = useState<string | null>(() => readStoredProvider());
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;

    const stored = readStoredProvider();
    const meta = readMetaProvider(user);

    if (stored && stored !== meta) {
      const next = { ...(user.unsafeMetadata ?? {}), [META_KEY]: stored };
      user.update({ unsafeMetadata: next as typeof user.unsafeMetadata }).catch(() => {});
      setTrackedProvider(stored);
      return;
    }

    setTrackedProvider(meta ?? stored);
  }, [user]);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  if (!isLoaded || !user) return null;

  const profile = buildProfile(user, trackedProvider);
  const initials = profile.displayName
    .split(' ')
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

  async function handleSignOut() {
    setOpen(false);
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(PROVIDER_KEY);
    }
    setTrackedProvider(null);
    await signOut();
    router.push('/');
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-slate-700 bg-slate-800 text-xs font-medium text-slate-200 transition hover:ring-2 hover:ring-indigo-400/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
      >
        {profile.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={profile.imageUrl}
            alt={profile.displayName}
            className="h-full w-full object-cover"
          />
        ) : (
          <span>{initials || 'U'}</span>
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-64 overflow-hidden rounded-lg border border-slate-700 bg-slate-900 shadow-xl shadow-black/40"
        >
          <div className="flex items-center gap-3 border-b border-slate-800 px-4 py-3">
            <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-full bg-slate-800">
              {profile.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.imageUrl}
                  alt={profile.displayName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-sm font-medium text-slate-200">
                  {initials || 'U'}
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">{profile.displayName}</p>
              <p className="truncate text-xs text-slate-400">{profile.email}</p>
              <p className="mt-0.5 text-[10px] uppercase tracking-wide text-indigo-300">
                via {profile.providerLabel}
              </p>
            </div>
          </div>

          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              openUserProfile();
            }}
            className="block w-full px-4 py-2 text-left text-sm text-slate-200 transition hover:bg-slate-800"
          >
            Manage account
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={handleSignOut}
            className="block w-full border-t border-slate-800 px-4 py-2 text-left text-sm text-slate-200 transition hover:bg-slate-800"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
