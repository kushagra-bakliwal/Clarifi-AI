import { supabase } from './supabaseClient';

// ─── API Base URL ─────────────────────────────────────────────────────────────
// Bug Fix #3: Changed from Supabase Edge Function URL to local FastAPI server.
// Bug Fix #10: getHeaders() now uses getSession() for the JWT token only
// (token validation happens server-side via live getUser()).
const API_BASE_URL = 'http://localhost:8000';

async function getHeaders(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession();
  return {
    'Authorization': `Bearer ${session?.access_token || ''}`,
    'Content-Type': 'application/json',
  };
}

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface Review {
  id: string;
  text: string;
  rating: number;
  date: string;
  customer_name: string;
  source: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  sentiment_score: number;
  keywords: string[];
  summary: string;
  is_urgent: boolean;
  priority: 'critical' | 'high' | 'medium' | 'low';
  is_feature_request: boolean;
  feature_text?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
}

export interface SentimentTrendPoint {
  date: string;
  sentiment: number;
  positive: number;
  negative: number;
  neutral: number;
  total: number;
}

export interface TopicBreakdownItem {
  topic: string;
  count: number;
  color: string;
}

export interface FunnelStage {
  name: string;
  count: number;
  percentage: number;
}

export interface KPIs {
  totalReviews: number;
  completedReviews: number;
  positiveReviews: number;
  negativeReviews: number;
  neutralReviews: number;
  avgRating: string;
  avgSentiment: string;
  criticalIssues: number;
  featureRequests: number;
  topNegativeKeywords: Array<{ text: string; value: number }>;
  sentimentTrend: SentimentTrendPoint[];
  topicBreakdown: TopicBreakdownItem[];
  funnelStats: FunnelStage[];
  recommendations: Recommendation[];
  lastUpdated: string;
}

export interface FeatureRequest {
  id: string;
  feature: string;
  description: string;
  requestedBy: string;
  date: string;
  votes: number;
  status: string;
  source: string;
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  priority: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  affectedArea: string;
  estimatedEffort: string;
  affectedUsers: number;
  detectedPattern: string;
  actionable: boolean;
  icon: 'alert' | 'trend' | 'zap' | 'shield' | 'clock';
}

export interface UploadHistoryItem {
  id: string;
  fileName: string;
  uploadedAt: string;
  newReviews: number;
  duplicatesSkipped: number;
}

// ─── Generic Fetch Helper ─────────────────────────────────────────────────────

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T | null> {
  try {
    const headers = await getHeaders();
    const mergedHeaders = {
      ...headers,
      ...(options?.headers as Record<string, string> || {}),
    };
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: mergedHeaders,
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      console.error(`API error at ${path} [${response.status}]:`, err);
      return null;
    }
    const result = await response.json();
    return result.data ?? null;
  } catch (error) {
    console.error(`Fetch error at ${path}:`, error);
    return null;
  }
}

// ─── API Functions ────────────────────────────────────────────────────────────

export async function fetchReviews(): Promise<Review[]> {
  return (await apiFetch<Review[]>('/reviews')) || [];
}

export async function fetchKPIs(): Promise<KPIs | null> {
  return apiFetch<KPIs>('/kpis');
}

export async function fetchFeatureRequests(): Promise<FeatureRequest[]> {
  return (await apiFetch<FeatureRequest[]>('/feature-requests')) || [];
}

export async function fetchRecommendations(): Promise<Recommendation[]> {
  return (await apiFetch<Recommendation[]>('/recommendations')) || [];
}

export async function fetchUploadHistory(): Promise<UploadHistoryItem[]> {
  return (await apiFetch<UploadHistoryItem[]>('/upload-history')) || [];
}

export async function chatWithData(query: string): Promise<string> {
  try {
    const headers = await getHeaders();
    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ query }),
    });
    if (!response.ok) throw new Error('Chat request failed');
    const result = await response.json();
    return result.data?.response || 'Sorry, I could not process your query.';
  } catch (error) {
    console.error('Error in chat:', error);
    return 'Sorry, there was an error processing your request.';
  }
}

export async function deleteAllData(): Promise<boolean> {
  try {
    const headers = await getHeaders();
    const response = await fetch(`${API_BASE_URL}/reviews`, {
      method: 'DELETE',
      headers,
    });
    return response.ok;
  } catch (error) {
    console.error('Error deleting data:', error);
    return false;
  }
}

// ─── Profile ──────────────────────────────────────────────────────────────────
// These hit Supabase directly (no FastAPI layer needed for user profile ops)

export async function fetchProfile(userId: string): Promise<any> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // Profile doesn't exist yet — return a default so the app doesn't break
      return { onboarding_completed: false };
    }
    console.error('Error fetching profile:', error);
    return null;
  }
  return data;
}

export async function updateProfile(userId: string, updates: Record<string, unknown>): Promise<boolean> {
  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId);

  if (error) {
    console.error('Error updating profile:', error);
    return false;
  }
  return true;
}


