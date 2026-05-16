'use client';

import { useCallback, useRef, useState } from 'react';
import { DocumentIcon, UploadIcon } from './icons';

export default function DropZone({
  csvFile,
  onFileChange,
}: {
  csvFile: File | null;
  onFileChange: (file: File | null) => void;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file?.name.endsWith('.csv')) {
        onFileChange(file);
      }
    },
    [onFileChange]
  );

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) onFileChange(file);
  }

  function clearInput() {
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
      className={`cursor-pointer rounded-lg border-2 border-dashed px-6 py-10 text-center transition ${
        isDragging
          ? 'border-indigo-400 bg-indigo-500/10'
          : csvFile
            ? 'border-indigo-400/40 bg-indigo-500/5'
            : 'border-slate-700 bg-slate-900/40 hover:border-slate-500 hover:bg-slate-900/60'
      }`}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        className="hidden"
        onChange={handleFileChange}
        onClick={(e) => {
          // Allow re-selecting the same file after a reset
          (e.target as HTMLInputElement).value = '';
          clearInput();
        }}
      />
      {csvFile ? (
        <div className="flex flex-col items-center gap-2">
          <DocumentIcon />
          <p className="text-sm font-medium text-indigo-200 break-all">{csvFile.name}</p>
          <p className="text-xs text-slate-500">Click to change file</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <UploadIcon />
          <p className="text-sm font-medium text-slate-200">
            {isDragging ? 'Drop your CSV here' : 'Drag & drop your CSV here'}
          </p>
          <p className="text-xs text-slate-500">or click to browse — .csv files only</p>
        </div>
      )}
    </div>
  );
}
