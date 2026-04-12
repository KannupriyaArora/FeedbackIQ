import Link from 'next/link';
import Button from '../components/Button';

export default function Home() {
  return (
    <main className="flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center px-6 text-center">
      <div className="max-w-xl space-y-5">
        <span className="inline-block rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-medium text-violet-600">
          Now in beta
        </span>

        <h1 className="text-5xl font-semibold tracking-tight text-gray-900">
          FeedbackIQ
        </h1>

        <p className="text-lg text-gray-500">
          Collect, organise, and understand feedback — all in one place.
        </p>

        <div className="flex items-center justify-center gap-3 pt-2">
          <Link href="/submit">
            <Button variant="primary">Get Started</Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="outline">View Dashboard</Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
