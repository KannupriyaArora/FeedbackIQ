'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import ManualSubmitForm from '../../components/submit/ManualSubmitForm';
import CsvUploadForm from '../../components/submit/CsvUploadForm';

type Tab = 'manual' | 'csv';

export default function SubmitPage() {
  const { user, isLoaded } = useUser();
  const [activeTab, setActiveTab] = useState<Tab>('manual');

  return (
    <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-12">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          Submit Feedback
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Share your thoughts and we will analyse them for you.
        </p>
      </div>

      <div className="mb-6 flex rounded-lg border border-slate-700 bg-slate-900/60 p-1">
        {(['manual', 'csv'] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 rounded-md py-2 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${
              activeTab === tab
                ? 'bg-indigo-500 text-white shadow-sm'
                : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
            }`}
          >
            {tab === 'manual' ? 'Manual Entry' : 'CSV Upload'}
          </button>
        ))}
      </div>

      {activeTab === 'manual' ? (
        <ManualSubmitForm userId={user?.id} isLoaded={isLoaded} />
      ) : (
        <CsvUploadForm userId={user?.id} />
      )}
    </main>
  );
}
