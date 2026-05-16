'use client';

import { AuthenticateWithRedirectCallback } from '@clerk/nextjs';

export default function SSOCallbackPage() {
  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4 sm:px-6">
      <div className="text-center">
        <p className="text-sm text-slate-400">Finishing sign-in…</p>
        <AuthenticateWithRedirectCallback
          signInFallbackRedirectUrl="/dashboard"
          signUpFallbackRedirectUrl="/dashboard"
        />
      </div>
    </div>
  );
}
