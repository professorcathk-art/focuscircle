export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isEmailVerified: boolean;
  preferences: UserPreferences;
  subscription: UserSubscription;
}

export interface UserPreferences {
  notificationFrequency: 'immediate' | 'daily' | 'weekly';
  notificationTypes: {
    email: boolean;
    inApp: boolean;
    push: boolean;
  };
  contentCategories: string[];
  timezone: string;
}

export interface UserSubscription {
  plan: 'free' | 'premium' | 'enterprise';
  maxWebsites: number;
  maxSummariesPerDay: number;
  subscriptionStartDate?: string;
  subscriptionEndDate?: string;
}

export interface Website {
  _id: string;
  userId: string;
  url: string;
  title: string;
  description: string;
  favicon?: string;
  category: string;
  monitoringFrequency: 'hourly' | 'daily' | 'weekly';
  isActive: boolean;
  lastChecked?: string;
  lastContentHash?: string;
  statistics: WebsiteStatistics;
  createdAt: string;
  updatedAt: string;
}

export interface WebsiteStatistics {
  totalChecks: number;
  successfulChecks: number;
  failedChecks: number;
  lastError?: {
    message: string;
    timestamp: string;
  };
}

export interface Summary {
  _id: string;
  userId: string;
  websiteId: string | Website;
  originalUrl: string;
  title: string;
  content: {
    original: string;
    summary: string;
    keyPoints: string[];
    wordCount: {
      original: number;
      summary: number;
    };
  };
  classification: {
    tier: 'tier1' | 'tier2';
    category: string;
    tags: string[];
    sentiment: 'positive' | 'negative' | 'neutral';
    urgency: 'low' | 'medium' | 'high' | 'critical';
  };
  aiMetadata: {
    model: string;
    processingTime: number;
    confidence: number;
    reasoning: string;
  };
  userFeedback?: {
    rating: number;
    isInterested: boolean;
    feedback?: string;
    feedbackTimestamp: string;
  };
  isRead: boolean;
  isArchived: boolean;
  publishedAt: string;
  extractedAt: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
    refreshToken: string;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  error?: string;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: {
    [key: string]: T[] | PaginationInfo;
    pagination: PaginationInfo;
  };
}

export interface UserStats {
  overview: {
    totalWebsites: number;
    totalSummaries: number;
    unreadSummaries: number;
  };
  recentActivity: Summary[];
  categoryDistribution: Array<{
    _id: string;
    count: number;
  }>;
  tierDistribution: Array<{
    _id: string;
    count: number;
  }>;
}

export interface TrendingTopic {
  _id: string;
  count: number;
  avgRating: number;
}

export interface Notification {
  id: string;
  type: 'summary' | 'system' | 'warning';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}
