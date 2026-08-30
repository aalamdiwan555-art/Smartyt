export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
}

export interface Profile {
  id: string;
  userId: string;
  creatorName?: string;
  mainLanguage: string;
  targetAudience?: string;
  contentFormat?: string;
  mainTopics: string[];
  goals: string[];
  onboardingCompleted: boolean;
  avatarUrl?: string;
}

export interface ContentDNA {
  id: string;
  userId: string;
  niche?: string;
  tone?: string;
  audience?: string;
  typicalDurationSeconds?: number;
  preferredFormats: string[];
  favoriteTopics: string[];
}

export interface YouTubeChannel {
  id: string;
  userId: string;
  youtubeChannelId: string;
  channelTitle?: string;
  avatarUrl?: string;
  subscriberCount?: number;
  isActive: boolean;
  connectedAt: string;
}

export interface VideoDraft {
  id: string;
  projectId?: string;
  userId: string;
  channelId?: string;
  title?: string;
  description?: string;
  tags: string[];
  categoryId?: string;
  language?: string;
  visibility: string;
  playlistId?: string;
  scheduledAt?: string;
  thumbnailUrl?: string;
  videoStoragePath?: string;
  status: string;
  checklist?: Record<string, boolean>;
  seoScore?: SEOScore;
  createdAt: string;
  updatedAt: string;
}

export interface SEOScore {
  overall: number;
  title: number;
  description: number;
  keywords: number;
  metadata: number;
  suggestions: string[];
}

export interface Idea {
  id: string;
  projectId: string;
  userId: string;
  titleConcept?: string;
  contentAngle?: string;
  hook?: string;
  targetAudience?: string;
  suggestedKeywords: string[];
  thumbnailConcept?: string;
  status: string;
  createdAt: string;
}

export interface Project {
  id: string;
  userId: string;
  channelId?: string;
  name: string;
  createdAt: string;
}

export interface AnalyticsData {
  views: number;
  watchTime: number;
  likes: number;
  comments: number;
  impressions: number;
  ctr: number;
  avgViewDuration: number;
  date: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface Subscription {
  id: string;
  userId: string;
  plan: string;
  status?: string;
  currentPeriodEnd?: string;
}

export interface Usage {
  id: string;
  userId: string;
  periodStart: string;
  aiGenerationsUsed: number;
  keywordSearchesUsed: number;
  thumbnailGenerationsUsed: number;
  uploadsUsed: number;
}

export interface AIGenerationRequest {
  type: 'idea' | 'title' | 'description' | 'script' | 'hashtags' | 'tags' | 'thumbnail_concept' | 'hook';
  input: Record<string, any>;
  channelId?: string;
}

export interface AIGenerationResponse {
  success: boolean;
  data?: any;
  error?: { code: string; message: string };
}

export interface KeywordResearchResult {
  keyword: string;
  relevance: number;
  competition?: string;
  trend?: string;
  source: string;
}

export interface ThumbnailProject {
  id: string;
  draftId?: string;
  userId: string;
  canvasJson?: unknown;
  exportedImageUrl?: string;
  updatedAt: string;
}

export interface ContentCalendarItem {
  id: string;
  userId: string;
  draftId?: string;
  title: string;
  scheduledDate: string;
  type: string;
  createdAt: string;
}

export interface Upload {
  id: string;
  draftId: string;
  userId: string;
  youtubeVideoId?: string;
  uploadStatus: string;
  progressPercent: number;
  errorMessage?: string;
  startedAt?: string;
  completedAt?: string;
}
