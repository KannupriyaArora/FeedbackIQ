'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSignUp } from '@clerk/nextjs/legacy';

const PROVIDER_KEY = 'feedbackiq:lastProvider';
type Strategy = 'oauth_github' | 'oauth_google';

export default function SignUpPage() {
  const { signUp, isLoaded } = useSignUp();
  const [loading, setLoading] = useState<Strategy | null>(null);
  const [error, setError] = useState<string | null>(null);

  const signUpWith = async (strategy: Strategy) => {
    if (!isLoaded || !signUp) return;
    try {
      setLoading(strategy);
      setError(null);
      localStorage.setItem(PROVIDER_KEY, strategy);
      await signUp.authenticateWithRedirect({
        strategy,
        redirectUrl: '/sso-callback',
        redirectUrlComplete: '/dashboard',
      });
    } catch (err) {
      setLoading(null);
      localStorage.removeItem(PROVIDER_KEY);
      setError(err instanceof Error ? err.message : 'Sign-up failed');
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4 sm:px-6">
      <div className="w-full max-w-sm space-y-6 rounded-xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl shadow-black/20 sm:p-8">
        <div className="text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-white">Create your account</h1>
          <p className="mt-1 text-sm text-slate-400">Start collecting feedback in seconds</p>
        </div>

        <div className="space-y-3">
          <button
            type="button"
            disabled={!isLoaded || loading !== null}
            onClick={() => signUpWith('oauth_github')}
            className="flex w-full items-center justify-center gap-2 rounded-md border border-slate-700 bg-slate-900/40 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:border-slate-500 hover:bg-slate-800/60 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <GitHubIcon />
            {loading === 'oauth_github' ? 'Redirecting…' : 'Continue with GitHub'}
          </button>

          <button
            type="button"
            disabled={!isLoaded || loading !== null}
            onClick={() => signUpWith('oauth_google')}
            className="flex w-full items-center justify-center gap-2 rounded-md border border-slate-700 bg-slate-900/40 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:border-slate-500 hover:bg-slate-800/60 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <GoogleIcon />
            {loading === 'oauth_google' ? 'Redirecting…' : 'Continue with Google'}
          </button>
        </div>

        {error && <p className="text-center text-sm text-rose-400">{error}</p>}

        <p className="text-center text-xs text-slate-500">
          Already have an account?{' '}
          <Link
            href="/sign-in"
            className="font-medium text-indigo-300 transition hover:text-indigo-200"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
      <path d="M12 .5C5.65.5.5 5.65.5 12a11.5 11.5 0 0 0 7.86 10.92c.58.1.79-.25.79-.56 0-.27-.01-1-.02-1.96-3.2.7-3.88-1.54-3.88-1.54-.52-1.33-1.28-1.69-1.28-1.69-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.71 1.26 3.37.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.7 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.79 0c2.21-1.49 3.18-1.18 3.18-1.18.62 1.59.23 2.76.11 3.05.74.81 1.18 1.84 1.18 3.1 0 4.43-2.69 5.41-5.26 5.69.41.36.78 1.06.78 2.14 0 1.55-.01 2.79-.01 3.17 0 .31.21.67.8.55A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.45c-.28 1.45-1.13 2.68-2.4 3.5v2.91h3.88c2.27-2.09 3.56-5.17 3.56-8.65z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-2.91c-1.08.72-2.45 1.16-4.05 1.16-3.13 0-5.78-2.11-6.73-4.96H1.27v3.09C3.25 21.3 7.31 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.38c-.25-.72-.38-1.49-.38-2.38s.14-1.66.38-2.38V6.53H1.27A11.97 11.97 0 0 0 0 12c0 1.94.46 3.78 1.27 5.47l4-3.09z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.43-3.43C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.7 1.27 6.53l4 3.09C6.22 6.86 8.87 4.75 12 4.75z"
      />
    </svg>
  );
}
