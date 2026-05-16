import type {
  ApiErrorBody,
  CreateFeedbackInput,
  CreateReportInput,
  CsvUploadResult,
  Feedback,
  Report,
  StatsResponse,
} from '../types';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly body?: ApiErrorBody
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function parseError(res: Response): Promise<ApiError> {
  const body = (await res.json().catch(() => ({}))) as ApiErrorBody;
  const message = body.errors?.[0]?.msg ?? body.error ?? `Request failed (${res.status})`;
  return new ApiError(res.status, message, body);
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, init);
  if (!res.ok) throw await parseError(res);
  return (await res.json()) as T;
}

export async function listFeedback(userId: string): Promise<Feedback[]> {
  return request<Feedback[]>(`/api/feedback?userId=${encodeURIComponent(userId)}`);
}

export async function getStats(userId: string): Promise<StatsResponse> {
  return request<StatsResponse>(`/api/feedback/stats?userId=${encodeURIComponent(userId)}`);
}

export async function createFeedback(input: CreateFeedbackInput): Promise<Feedback> {
  return request<Feedback>('/api/feedback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
}

export async function uploadCsv(userId: string, file: File): Promise<CsvUploadResult> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('userId', userId);
  return request<CsvUploadResult>('/api/feedback/csv', {
    method: 'POST',
    body: formData,
  });
}

export async function createReport(input: CreateReportInput): Promise<{ slug: string }> {
  return request<{ slug: string }>('/api/reports', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
}

export async function getReport(slug: string): Promise<Report> {
  return request<Report>(`/api/reports/${encodeURIComponent(slug)}`);
}
