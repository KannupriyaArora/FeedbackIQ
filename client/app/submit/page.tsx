'use client';

import { useState, useRef, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import Link from 'next/link';
import Button from '../../components/Button';

type Tab = 'manual' | 'csv';
type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

interface FormValues {
  rawText: string;
}

interface SubmitResult {
  _id: string;
  rawText: string;
}

interface UploadResult {
  total: number;
  successful: number;
  failed: number;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export default function SubmitPage() {
  const [activeTab, setActiveTab] = useState<Tab>('manual');

  // Manual entry state
  const [submitResult, setSubmitResult] = useState<SubmitResult | null>(null);
  const [serverError, setServerError] = useState('');

  // CSV upload state
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle');
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ defaultValues: { rawText: '' } });

  async function onSubmit(data: FormValues) {
    setServerError('');
    setSubmitResult(null);

    const res = await fetch(`${API_URL}/api/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rawText: data.rawText, source: 'manual' }),
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

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file?.name.endsWith('.csv')) {
      setCsvFile(file);
      setUploadStatus('idle');
      setUploadError('');
    }
  }, []);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setCsvFile(file);
      setUploadStatus('idle');
      setUploadError('');
    }
  }

  async function handleCsvUpload() {
    if (!csvFile) return;
    setUploadStatus('uploading');
    setUploadError('');
    setUploadResult(null);

    try {
      const formData = new FormData();
      formData.append('file', csvFile);

      const res = await fetch(`${API_URL}/api/feedback/csv`, {
        method: 'POST',
        body: formData,
      });

      const body = await res.json().catch(() => ({}));

      if (!res.ok) {
        setUploadError(body.error || 'Upload failed. Please try again.');
        setUploadStatus('error');
        return;
      }

      setUploadResult(body as UploadResult);
      setUploadStatus('success');
      setCsvFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch {
      setUploadError('Network error. Please check your connection and try again.');
      setUploadStatus('error');
    }
  }

  function resetCsvUpload() {
    setCsvFile(null);
    setUploadStatus('idle');
    setUploadResult(null);
    setUploadError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Submit Feedback</h1>
        <p className="mt-1 text-sm text-gray-500">
          Share your thoughts and we will analyse them for you.
        </p>
      </div>

      {/* Tab switcher */}
      <div className="mb-6 flex rounded-lg border border-gray-200 bg-gray-50 p-1">
        {(['manual', 'csv'] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 ${
              activeTab === tab
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab === 'manual' ? 'Manual Entry' : 'CSV Upload'}
          </button>
        ))}
      </div>

      {/* ── Manual Entry Tab ── */}
      {activeTab === 'manual' && (
        <>
          {submitResult && (
            <div className="mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-4">
              <p className="text-sm font-medium text-green-800">Feedback submitted successfully!</p>
              <p className="mt-1 font-mono text-xs text-green-600">ID: {submitResult._id}</p>
              <div className="mt-3 flex gap-2">
                <Link href="/dashboard">
                  <Button variant="outline" className="px-3 py-1 text-xs">
                    View Dashboard
                  </Button>
                </Link>
                <Button
                  variant="secondary"
                  className="px-3 py-1 text-xs"
                  onClick={() => setSubmitResult(null)}
                >
                  Submit Another
                </Button>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
            <div className="space-y-1.5">
              <label htmlFor="rawText" className="block text-sm font-medium text-gray-700">
                Your feedback
                <span className="ml-1 font-normal text-gray-400">(min 10 characters)</span>
              </label>
              <textarea
                id="rawText"
                rows={6}
                placeholder="Write your feedback here..."
                {...register('rawText', {
                  required: 'Feedback text is required.',
                  minLength: { value: 10, message: 'Feedback must be at least 10 characters.' },
                })}
                className={`w-full resize-none rounded-lg border bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 shadow-sm outline-none transition
                  ${
                    errors.rawText
                      ? 'border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100'
                      : 'border-gray-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-100'
                  }`}
              />
              {errors.rawText && (
                <p className="text-xs text-red-500">{errors.rawText.message}</p>
              )}
            </div>

            {serverError && (
              <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                {serverError}
              </div>
            )}

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
        </>
      )}

      {/* ── CSV Upload Tab ── */}
      {activeTab === 'csv' && (
        <div className="space-y-5">
          {uploadStatus === 'success' && uploadResult ? (
            <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-4">
              <p className="text-sm font-medium text-green-800">
                {uploadResult.successful}{' '}
                {uploadResult.successful === 1 ? 'entry' : 'entries'} analysed successfully!
              </p>
              {uploadResult.failed > 0 && (
                <p className="mt-1 text-xs text-green-600">
                  {uploadResult.failed} {uploadResult.failed === 1 ? 'row' : 'rows'} skipped
                  (empty rawText or invalid).
                </p>
              )}
              <div className="mt-3 flex gap-2">
                <Link href="/dashboard">
                  <Button variant="outline" className="px-3 py-1 text-xs">
                    View Dashboard
                  </Button>
                </Link>
                <Button variant="secondary" className="px-3 py-1 text-xs" onClick={resetCsvUpload}>
                  Upload Another
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Template download */}
              <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-gray-700">Need a template?</p>
                  <p className="text-xs text-gray-500">
                    Required column: <span className="font-mono">rawText</span> — optional:{' '}
                    <span className="font-mono">source</span>
                  </p>
                </div>
                <a
                  href="/sample.csv"
                  download
                  className="text-xs font-medium text-violet-600 underline underline-offset-2 hover:text-violet-700"
                >
                  Download sample.csv
                </a>
              </div>

              {/* Drop zone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`cursor-pointer rounded-lg border-2 border-dashed px-6 py-10 text-center transition-colors duration-150 ${
                  isDragging
                    ? 'border-violet-400 bg-violet-50'
                    : csvFile
                      ? 'border-violet-300 bg-violet-50/50'
                      : 'border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-gray-100'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={handleFileChange}
                />
                {csvFile ? (
                  <div className="flex flex-col items-center gap-2">
                    <svg
                      className="h-8 w-8 text-violet-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                      />
                    </svg>
                    <p className="text-sm font-medium text-violet-700">{csvFile.name}</p>
                    <p className="text-xs text-gray-400">Click to change file</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <svg
                      className="h-8 w-8 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                      />
                    </svg>
                    <p className="text-sm font-medium text-gray-700">
                      {isDragging ? 'Drop your CSV here' : 'Drag & drop your CSV here'}
                    </p>
                    <p className="text-xs text-gray-400">or click to browse — .csv files only</p>
                  </div>
                )}
              </div>

              {/* Error banner */}
              {uploadStatus === 'error' && uploadError && (
                <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {uploadError}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-3">
                <Button
                  variant="primary"
                  disabled={!csvFile || uploadStatus === 'uploading'}
                  onClick={handleCsvUpload}
                >
                  {uploadStatus === 'uploading' ? (
                    <span className="flex items-center gap-2">
                      <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                      </svg>
                      Uploading…
                    </span>
                  ) : (
                    'Upload & Analyse'
                  )}
                </Button>
                <Link href="/dashboard">
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
              </div>
            </>
          )}
        </div>
      )}
    </main>
  );
}
