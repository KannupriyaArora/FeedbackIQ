'use client';

import Link from 'next/link';
import { Show, SignInButton } from '@clerk/nextjs';
import UserMenu from './UserMenu';

export default function Navbar() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-800 bg-[#0f172a]/90 backdrop-blur-sm">
      <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="text-sm font-semibold tracking-tight text-white transition-colors hover:text-indigo-300"
        >
          FeedbackIQ
        </Link>

        <div className="flex items-center gap-1">
          <Show when="signed-in">
            <>
              <Link
                href="/dashboard"
                className="rounded-md px-3 py-1.5 text-sm text-slate-400 transition-colors hover:bg-slate-800/60 hover:text-white"
              >
                Dashboard
              </Link>
              <Link
                href="/submit"
                className="ml-1 rounded-md bg-indigo-500 px-3 py-1.5 text-sm font-medium text-white shadow-lg shadow-indigo-500/20 transition hover:bg-indigo-400 sm:ml-2"
              >
                <span className="hidden sm:inline">Submit Feedback</span>
                <span className="sm:hidden">Submit</span>
              </Link>
              <div className="ml-2 sm:ml-3">
                <UserMenu />
              </div>
            </>
          </Show>

          <Show when="signed-out">
            <SignInButton mode="redirect">
              <button className="rounded-md px-3 py-1.5 text-sm text-slate-300 transition-colors hover:bg-slate-800/60 hover:text-white">
                Sign In
              </button>
            </SignInButton>
          </Show>
        </div>
      </nav>
    </header>
  );
}
