'use client';

import { useState } from 'react';
import Link from 'next/link';
import Button from '../Button';
import DropZone from './DropZone';
import { Spinner } from './icons';
import { ApiError, uploadCsv } from '../../lib/api';
import type { CsvUploadResult } from '../../types';

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

export default function CsvUploadForm({ userId }: { userId: string | undefined }) {
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle');
  const [uploadResult, setUploadResult] = useState<CsvUploadResult | null>(null);
  const [uploadError, setUploadError] = useState('');

  function handleFileChange(file: File | null) {
    setCsvFile(file);
    setUploadStatus('idle');
    setUploadError('');
  }

  async function handleCsvUpload() {
    if (!csvFile) return;
    if (!userId) {
      setUploadError('Still signing you in — please try again in a moment.');
      setUploadStatus('error');
      return;
    }
    setUploadStatus('uploading');
    setUploadError('');
    setUploadResult(null);

    try {
      const result = await uploadCsv(userId, csvFile);
      setUploadResult(result);
      setUploadStatus('success');
      setCsvFile(null);
    } catch (err) {
      if (err instanceof ApiError) {
        setUploadError(err.message);
      } else {
        setUploadError('Network error. Please check your connection and try again.');
      }
      setUploadStatus('error');
    }
  }

  function resetCsvUpload() {
    setCsvFile(null);
    setUploadStatus('idle');
    setUploadResult(null);
    setUploadError('');
  }

  if (uploadStatus === 'success' && uploadResult) {
    return (
      <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-4">
        <p className="text-sm font-medium text-emerald-200">
          {uploadResult.successful === 1 ? '1 entry' : `${uploadResult.successful} entries`}{' '}
          analysed successfully!
        </p>
        {uploadResult.failed > 0 && (
          <p className="mt-1 text-xs text-emerald-300/80">
            {uploadResult.failed === 1 ? '1 row' : `${uploadResult.failed} rows`} skipped (empty
            rawText or invalid).
          </p>
        )}
        <div className="mt-3 flex flex-wrap gap-2">
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
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col items-start justify-between gap-2 rounded-lg border border-slate-800 bg-slate-900/40 px-4 py-3 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-medium text-slate-200">Need a template?</p>
          <p className="text-xs text-slate-500">
            Required column: <span className="font-mono text-slate-400">rawText</span> — optional:{' '}
            <span className="font-mono text-slate-400">source</span>
          </p>
        </div>
        <a
          href="/sample.csv"
          download
          className="text-xs font-medium text-indigo-300 underline underline-offset-2 transition hover:text-indigo-200"
        >
          Download sample.csv
        </a>
      </div>

      <DropZone csvFile={csvFile} onFileChange={handleFileChange} />

      {uploadStatus === 'error' && uploadError && (
        <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
          {uploadError}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <Button
          variant="primary"
          disabled={!csvFile || uploadStatus === 'uploading'}
          onClick={handleCsvUpload}
        >
          {uploadStatus === 'uploading' ? (
            <span className="flex items-center gap-2">
              <Spinner />
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
    </div>
  );
}
