import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { 
  AuthResponse, 
  ApiResponse, 
  User, 
  Website, 
  Summary, 
  UserStats,
  TrendingTopic,
  Notification,
  PaginatedResponse
} from '../types';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle token refresh
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          
          try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (refreshToken) {
              const response = await this.refreshToken(refreshToken);
              localStorage.setItem('token', response.data.token);
              localStorage.setItem('refreshToken', response.data.refreshToken);
              
              // Retry original request
              originalRequest.headers.Authorization = `Bearer ${response.data.token}`;
              return this.api(originalRequest);
            }
          } catch (refreshError) {
            // Refresh failed, redirect to login
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            window.location.href = '/login';
          }
        }
        
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async register(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }): Promise<AuthResponse> {
    const response = await this.api.post('/auth/register', userData);
    return response.data;
  }

  async login(credentials: {
    email: string;
    password: string;
  }): Promise<AuthResponse> {
    const response = await this.api.post('/auth/login', credentials);
    return response.data;
  }

  async refreshToken(refreshToken: string): Promise<ApiResponse<{ token: string; refreshToken: string }>> {
    const response = await this.api.post('/auth/refresh-token', { refreshToken });
    return response.data;
  }

  async logout(): Promise<ApiResponse<null>> {
    const response = await this.api.post('/auth/logout');
    return response.data;
  }

  async verifyEmail(token: string): Promise<ApiResponse<null>> {
    const response = await this.api.get(`/auth/verify-email/${token}`);
    return response.data;
  }

  async forgotPassword(email: string): Promise<ApiResponse<null>> {
    const response = await this.api.post('/auth/forgot-password', { email });
    return response.data;
  }

  async resetPassword(token: string, password: string): Promise<ApiResponse<null>> {
    const response = await this.api.post(`/auth/reset-password/${token}`, { password });
    return response.data;
  }

  // User endpoints
  async getProfile(): Promise<ApiResponse<{ user: User }>> {
    const response = await this.api.get('/user/profile');
    return response.data;
  }

  async updateProfile(userData: Partial<User>): Promise<ApiResponse<{ user: User }>> {
    const response = await this.api.put('/user/profile', userData);
    return response.data;
  }

  async updatePassword(passwordData: {
    currentPassword: string;
    newPassword: string;
  }): Promise<ApiResponse<null>> {
    const response = await this.api.put('/user/password', passwordData);
    return response.data;
  }

  async updatePreferences(preferences: Partial<User['preferences']>): Promise<ApiResponse<{ preferences: User['preferences'] }>> {
    const response = await this.api.put('/user/preferences', preferences);
    return response.data;
  }

  async getUserStats(): Promise<ApiResponse<UserStats>> {
    const response = await this.api.get('/user/stats');
    return response.data;
  }

  async getUserActivity(page = 1, limit = 20): Promise<PaginatedResponse<Summary>> {
    const response = await this.api.get(`/user/activity?page=${page}&limit=${limit}`);
    return response.data;
  }

  async exportUserData(): Promise<Blob> {
    const response = await this.api.get('/user/export', {
      responseType: 'blob'
    });
    return response.data;
  }

  async deleteAccount(): Promise<ApiResponse<null>> {
    const response = await this.api.delete('/user/account');
    return response.data;
  }

  // Website endpoints
  async getWebsites(page = 1, limit = 20, filters?: {
    category?: string;
    isActive?: boolean;
  }): Promise<PaginatedResponse<Website>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters
    });
    const response = await this.api.get(`/websites?${params}`);
    return response.data;
  }

  async createWebsite(websiteData: {
    url: string;
    title?: string;
    description?: string;
    category?: string;
    monitoringFrequency?: string;
  }): Promise<ApiResponse<{ website: Website }>> {
    const response = await this.api.post('/websites', websiteData);
    return response.data;
  }

  async getWebsite(id: string): Promise<ApiResponse<{ website: Website }>> {
    const response = await this.api.get(`/websites/${id}`);
    return response.data;
  }

  async updateWebsite(id: string, websiteData: Partial<Website>): Promise<ApiResponse<{ website: Website }>> {
    const response = await this.api.put(`/websites/${id}`, websiteData);
    return response.data;
  }

  async deleteWebsite(id: string): Promise<ApiResponse<null>> {
    const response = await this.api.delete(`/websites/${id}`);
    return response.data;
  }

  async bulkImportWebsites(websites: Array<{
    url: string;
    title?: string;
    description?: string;
    category?: string;
    monitoringFrequency?: string;
  }>): Promise<ApiResponse<{ imported: Website[]; errors: any[] }>> {
    const response = await this.api.post('/websites/bulk-import', { websites });
    return response.data;
  }

  async testWebsite(id: string): Promise<ApiResponse<{ testResult: any }>> {
    const response = await this.api.post(`/websites/${id}/test`);
    return response.data;
  }

  async getWebsiteStatus(id: string): Promise<ApiResponse<{ status: any }>> {
    const response = await this.api.get(`/websites/${id}/status`);
    return response.data;
  }

  async manualCheck(id: string): Promise<ApiResponse<{ hasNewContent: boolean; summary?: Summary }>> {
    const response = await this.api.post(`/websites/${id}/check`);
    return response.data;
  }

  async getWebsiteStats(id: string): Promise<ApiResponse<{ website: Website; statistics: any }>> {
    const response = await this.api.get(`/websites/${id}/stats`);
    return response.data;
  }

  // Summary endpoints
  async getSummaries(page = 1, limit = 20, filters?: {
    tier?: string;
    category?: string;
    isRead?: boolean;
    startDate?: string;
    endDate?: string;
  }): Promise<PaginatedResponse<Summary>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters
    });
    const response = await this.api.get(`/summaries?${params}`);
    return response.data;
  }

  async getSummary(id: string): Promise<ApiResponse<{ summary: Summary }>> {
    const response = await this.api.get(`/summaries/${id}`);
    return response.data;
  }

  async markAsRead(id: string): Promise<ApiResponse<{ summary: Summary }>> {
    const response = await this.api.put(`/summaries/${id}/read`);
    return response.data;
  }

  async addFeedback(id: string, feedback: {
    rating?: number;
    isInterested?: boolean;
    feedback?: string;
  }): Promise<ApiResponse<{ summary: Summary }>> {
    const response = await this.api.put(`/summaries/${id}/feedback`, feedback);
    return response.data;
  }

  async archiveSummary(id: string): Promise<ApiResponse<{ summary: Summary }>> {
    const response = await this.api.put(`/summaries/${id}/archive`);
    return response.data;
  }

  async getRelatedSummaries(id: string, limit = 5): Promise<ApiResponse<{ relatedSummaries: Summary[] }>> {
    const response = await this.api.get(`/summaries/${id}/related?limit=${limit}`);
    return response.data;
  }

  async searchSummaries(query: string, page = 1, limit = 20): Promise<PaginatedResponse<Summary>> {
    const response = await this.api.get(`/summaries/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`);
    return response.data;
  }

  async getTrendingTopics(days = 7): Promise<ApiResponse<{ trendingTopics: TrendingTopic[] }>> {
    const response = await this.api.get(`/summaries/trending?days=${days}`);
    return response.data;
  }

  async getAnalyticsOverview(days = 30): Promise<ApiResponse<any>> {
    const response = await this.api.get(`/summaries/analytics/overview?days=${days}`);
    return response.data;
  }

  async getCategoryAnalytics(category: string, days = 30): Promise<ApiResponse<any>> {
    const response = await this.api.get(`/summaries/analytics/categories/${category}?days=${days}`);
    return response.data;
  }

  // Notification endpoints
  async getNotifications(page = 1, limit = 20): Promise<PaginatedResponse<Notification>> {
    const response = await this.api.get(`/notifications?page=${page}&limit=${limit}`);
    return response.data;
  }

  async markNotificationAsRead(id: string): Promise<ApiResponse<null>> {
    const response = await this.api.put(`/notifications/${id}/read`);
    return response.data;
  }

  async markAllNotificationsAsRead(): Promise<ApiResponse<null>> {
    const response = await this.api.put('/notifications/read-all');
    return response.data;
  }

  async deleteNotification(id: string): Promise<ApiResponse<null>> {
    const response = await this.api.delete(`/notifications/${id}`);
    return response.data;
  }

  async getNotificationPreferences(): Promise<ApiResponse<{ preferences: any; frequency: string }>> {
    const response = await this.api.get('/notifications/preferences');
    return response.data;
  }

  async updateNotificationPreferences(preferences: any): Promise<ApiResponse<{ preferences: any; frequency: string }>> {
    const response = await this.api.put('/notifications/preferences', preferences);
    return response.data;
  }

  async sendTestNotification(type: string, email?: string): Promise<ApiResponse<null>> {
    const response = await this.api.post('/notifications/test', { type, email });
    return response.data;
  }
}

export default new ApiService();
