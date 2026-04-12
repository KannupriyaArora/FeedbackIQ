import Link from 'next/link';

export default function Navbar() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-gray-200 bg-white/90 backdrop-blur-sm">
      <nav className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
        <Link
          href="/"
          className="text-sm font-semibold tracking-tight text-gray-900 hover:text-violet-600 transition-colors"
        >
          FeedbackIQ
        </Link>

        <div className="flex items-center gap-1">
          <Link
            href="/dashboard"
            className="rounded-md px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors"
          >
            Dashboard
          </Link>
          <Link
            href="/submit"
            className="ml-2 rounded-md bg-violet-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-violet-500 transition-colors"
          >
            Submit Feedback
          </Link>
        </div>
      </nav>
    </header>
  );
}
