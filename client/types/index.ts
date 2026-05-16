export type Sentiment = 'positive' | 'negative' | 'neutral';
export type FeedbackSource = 'manual' | 'csv';
export type SentimentFilter = 'all' | Sentiment;

export interface Feedback {
  _id: string;
  rawText: string;
  source: FeedbackSource;
  sentiment: Sentiment | null;
  category: string | null;
  summary: string | null;
  createdAt: string;
}

export interface CategoryCount {
  category: string;
  count: number;
}

export interface StatsResponse {
  total: number;
  positive: number;
  negative: number;
  neutral: number;
  topCategories: CategoryCount[];
  averageConfidence: number;
}

export interface Report {
  _id: string;
  title: string;
  slug: string;
  createdAt: string;
  entries: Feedback[];
  stats: StatsResponse;
}

export interface CreateFeedbackInput {
  userId: string;
  rawText: string;
  source: FeedbackSource;
}

export interface CreateReportInput {
  title: string;
  feedbackIds: string[];
}

export interface CsvUploadResult {
  total: number;
  successful: number;
  failed: number;
}

export interface ApiErrorBody {
  error?: string;
  errors?: { msg: string }[];
}
