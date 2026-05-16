'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import Link from 'next/link';
import Button from '../Button';
import SubmitResult, { SubmitResultStatus } from './SubmitResult';
import { ApiError, createFeedback } from '../../lib/api';
import type { Feedback } from '../../types';

interface FormValues {
  rawText: string;
}

type ResultState = { status: SubmitResultStatus; entry: Feedback } | null;

export default function ManualSubmitForm({
  userId,
  isLoaded,
}: {
  userId: string | undefined;
  isLoaded: boolean;
}) {
  const [result, setResult] = useState<ResultState>(null);
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ defaultValues: { rawText: '' } });

  async function onSubmit(data: FormValues) {
    setServerError('');

    if (!userId) {
      setServerError('Still signing you in — please try again in a moment.');
      return;
    }

    // Optimistic update: render the card immediately, before the API responds.
    const optimisticEntry: Feedback = {
      _id: `optimistic-${Date.now()}`,
      rawText: data.rawText,
      source: 'manual',
      sentiment: null,
      category: null,
      summary: null,
      createdAt: new Date().toISOString(),
    };
    setResult({ status: 'analyzing', entry: optimisticEntry });
    reset();

    try {
      const saved = await createFeedback({
        // NOTE: userId is trusted from the client. In production, verify server-side
        // using Clerk's JWT (e.g. with @clerk/backend verifyToken).
        userId,
        rawText: data.rawText,
        source: 'manual',
      });
      setResult({ status: 'success', entry: saved });
    } catch (err) {
      // Roll back the optimistic card and surface the error.
      setResult(null);
      if (err instanceof ApiError) {
        setServerError(err.message);
      } else {
        setServerError('Network error. Please check your connection and try again.');
      }
    }
  }

  return (
    <>
      {result && (
        <SubmitResult
          entry={result.entry}
          status={result.status}
          onDismiss={() => setResult(null)}
        />
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
        <div className="space-y-1.5">
          <label htmlFor="rawText" className="block text-sm font-medium text-slate-200">
            Your feedback
            <span className="ml-1 font-normal text-slate-500">(min 10 characters)</span>
          </label>
          <textarea
            id="rawText"
            rows={6}
            placeholder="Write your feedback here..."
            {...register('rawText', {
              required: 'Feedback text is required.',
              minLength: { value: 10, message: 'Feedback must be at least 10 characters.' },
            })}
            className={`w-full resize-none rounded-lg border bg-slate-900/60 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition
              ${
                errors.rawText
                  ? 'border-rose-500/50 focus:border-rose-400 focus:ring-2 focus:ring-rose-500/20'
                  : 'border-slate-700 hover:border-slate-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'
              }`}
          />
          {errors.rawText && <p className="text-xs text-rose-400">{errors.rawText.message}</p>}
        </div>

        {serverError && (
          <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
            {serverError}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <Button type="submit" variant="primary" disabled={isSubmitting || !isLoaded}>
            {isSubmitting ? 'Submitting…' : 'Submit Feedback'}
          </Button>
          <Link href="/dashboard">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </>
  );
}
