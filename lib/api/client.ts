/**
 * API Client for GOFER EXAM Backend
 * 
 * Axios-based HTTP client with JWT token management and interceptors.
 */

import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export interface ScholarshipApiRecord {
  id: string;
  slug: string;
  name: string;
  short_description: string;
  description?: string;
  provider: string;
  country: string;
  type: string;
  level: string;
  amount: string;
  amount_type: string;
  application_deadline: string;
  application_url?: string;
  website_url?: string;
  status: string;
  is_featured: boolean;
  eligibility?: string[];
  fields?: string[];
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Token management
const getAccessToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('access_token');
  }
  return null;
};

const getRefreshToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('refresh_token');
  }
  return null;
};

const setTokens = (access: string, refresh: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
  }
};

const clearTokens = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  }
};

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = getRefreshToken();

      if (!refreshToken) {
        clearTokens();
        if (typeof window !== 'undefined') {
          window.location.href = '/student/login';
        }
        return Promise.reject(error);
      }

      try {
        const response = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
          refresh: refreshToken,
        });

        const { access } = response.data;
        setTokens(access, refreshToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${access}`;
        }

        processQueue(null, access);
        isRefreshing = false;

        return apiClient(originalRequest);
      } catch (err) {
        processQueue(err as Error, null);
        clearTokens();
        if (typeof window !== 'undefined') {
          window.location.href = '/student/login';
        }
        isRefreshing = false;
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

// API Methods
export const api = {
  // Authentication
  auth: {
    register: async (data: {
      email: string;
      password: string;
      password2: string;
      first_name: string;
      last_name: string;
      phone_number?: string;
    }) => {
      const response = await apiClient.post('/auth/register/', data);
      const { user, tokens } = response.data;
      setTokens(tokens.access, tokens.refresh);
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(user));
      }
      return response.data;
    },

    login: async (data: { email: string; password: string }) => {
      const response = await apiClient.post('/auth/login/', data);
      const { user, tokens } = response.data;
      setTokens(tokens.access, tokens.refresh);
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(user));
      }
      return response.data;
    },

    logout: async () => {
      const refreshToken = getRefreshToken();
      try {
        await apiClient.post('/auth/logout/', { refresh: refreshToken });
      } catch (error) {
        console.error('Logout error:', error);
      } finally {
        clearTokens();
      }
    },

    refreshToken: async () => {
      const refreshToken = getRefreshToken();
      if (!refreshToken) throw new Error('No refresh token');

      const response = await apiClient.post('/auth/token/refresh/', {
        refresh: refreshToken,
      });
      const { access } = response.data;
      setTokens(access, refreshToken);
      return response.data;
    },

    getCurrentUser: async () => {
      const response = await apiClient.get('/auth/me/');
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(response.data));
      }
      return response.data;
    },

    updateProfile: async (data: {
      first_name?: string;
      last_name?: string;
      phone_number?: string;
    }) => {
      const response = await apiClient.patch('/auth/me/', data);
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(response.data));
      }
      return response.data;
    },
  },

  // Scholarships
  scholarships: {
    list: async (params?: {
      country?: string;
      type?: string;
      level?: string;
      status?: string;
      is_featured?: boolean;
      search?: string;
      ordering?: string;
      page?: number;
    }) => {
      const response = await apiClient.get<PaginatedResponse<ScholarshipApiRecord>>('/scholarships/', { params });
      return response.data;
    },

    get: async (slug: string) => {
      const response = await apiClient.get<ScholarshipApiRecord>(`/scholarships/${slug}/`);
      return response.data;
    },
  },

  // Universities
  universities: {
    list: async (params?: {
      country?: string;
      city?: string;
      type?: string;
      is_featured?: boolean;
      is_partner?: boolean;
      search?: string;
      ordering?: string;
      page?: number;
    }) => {
      const response = await apiClient.get('/universities/', { params });
      return response.data;
    },

    get: async (slug: string) => {
      const response = await apiClient.get(`/universities/${slug}/`);
      return response.data;
    },
  },

  // Destinations
  destinations: {
    list: async (params?: {
      is_popular?: boolean;
      is_featured?: boolean;
      english_required?: boolean;
      work_while_studying?: boolean;
      search?: string;
      ordering?: string;
      page?: number;
    }) => {
      const response = await apiClient.get('/destinations/', { params });
      return response.data;
    },

    get: async (slug: string) => {
      const response = await apiClient.get(`/destinations/${slug}/`);
      return response.data;
    },
  },
};

// Helper to get current user from localStorage
export const getCurrentUserFromStorage = () => {
  if (typeof window !== 'undefined') {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }
  return null;
};

// Helper to check if user is authenticated
export const isAuthenticated = (): boolean => {
  return !!getAccessToken();
};

// Helper to clear auth data
export const clearAuth = () => {
  clearTokens();
};

export default apiClient;
