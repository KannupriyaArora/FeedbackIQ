'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import Link from 'next/link';
import Button from '../../components/Button';

interface FormValues {
  rawText: string;
  source: 'manual' | 'csv';
}

interface SubmitResult {
  _id: string;
  rawText: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export default function SubmitPage() {
  const [submitResult, setSubmitResult] = useState<SubmitResult | null>(null);
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: { rawText: '', source: 'manual' },
  });

  async function onSubmit(data: FormValues) {
    setServerError('');
    setSubmitResult(null);

    const res = await fetch(`${API_URL}/api/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setServerError(body.errors?.[0]?.msg || 'Something went wrong. Please try again.');
      return;
    }

    const saved: SubmitResult = await res.json();
    setSubmitResult(saved);
    reset();
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Submit Feedback</h1>
        <p className="mt-1 text-sm text-gray-500">
          Share your thoughts and we will analyse them for you.
        </p>
      </div>

      {/* Success banner */}
      {submitResult && (
        <div className="mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-4">
          <p className="text-sm font-medium text-green-800">Feedback submitted successfully!</p>
          <p className="mt-1 text-xs text-green-600 font-mono">ID: {submitResult._id}</p>
          <div className="mt-3 flex gap-2">
            <Link href="/dashboard">
              <Button variant="outline" className="text-xs py-1 px-3">
                View Dashboard
              </Button>
            </Link>
            <Button
              variant="secondary"
              className="text-xs py-1 px-3"
              onClick={() => setSubmitResult(null)}
            >
              Submit Another
            </Button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
        {/* Feedback textarea */}
        <div className="space-y-1.5">
          <label htmlFor="rawText" className="block text-sm font-medium text-gray-700">
            Your feedback
            <span className="ml-1 text-gray-400 font-normal">(min 10 characters)</span>
          </label>
          <textarea
            id="rawText"
            rows={6}
            placeholder="Write your feedback here..."
            {...register('rawText', {
              required: 'Feedback text is required.',
              minLength: {
                value: 10,
                message: 'Feedback must be at least 10 characters.',
              },
            })}
            className={`w-full rounded-lg border bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 shadow-sm outline-none transition resize-none
              ${
                errors.rawText
                  ? 'border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100'
                  : 'border-gray-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-100'
              }`}
          />
          {errors.rawText && <p className="text-xs text-red-500">{errors.rawText.message}</p>}
        </div>

        {/* Source dropdown */}
        <div className="space-y-1.5">
          <label htmlFor="source" className="block text-sm font-medium text-gray-700">
            Source
          </label>
          <select
            id="source"
            {...register('source', { required: true })}
            className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 shadow-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100 appearance-none cursor-pointer"
          >
            <option value="manual">Manual Entry</option>
            <option value="csv">CSV Upload</option>
          </select>
        </div>

        {/* Server error */}
        {serverError && (
          <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
            {serverError}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3 pt-1">
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting…' : 'Submit Feedback'}
          </Button>
          <Link href="/dashboard">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </main>
  );
}
