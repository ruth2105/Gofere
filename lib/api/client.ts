/**
 * API client for GOFER EXAM.
 * Browser sessions use HttpOnly JWT cookies and a CSRF token kept in memory.
 */

import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from 'axios';

const API_BASE_URL = '/api/v1';

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

export interface UniversityApiRecord {
  id: string;
  slug: string;
  name: string;
  country: string;
  city: string;
  type: string;
  description?: string;
  world_ranking: number | null;
  total_students: number;
  international_students: number;
  international_student_percentage: number;
  tuition_fee: string | null;
  national_ranking?: number | null;
  founded_year?: number | null;
  acceptance_rate?: string | null;
  application_fee?: string;
  minimum_gpa?: string | null;
  is_featured: boolean;
  is_partner: boolean;
  website_url?: string;
  admissions_email?: string;
  phone_number?: string;
  programs?: string[];
  popular_majors?: string[];
  required_tests?: string[];
  address?: string;
  image?: string | null;
  logo?: string | null;
}

export interface DestinationApiRecord {
  id: string;
  slug: string;
  name: string;
  flag_emoji: string;
  description: string;
  total_universities: number;
  international_students: number;
  is_popular: boolean;
  is_featured: boolean;
  average_tuition_fee: string;
  average_living_cost: string;
  primary_language: string;
  highlights?: string[];
  work_while_studying?: boolean;
  work_hours_per_week?: number;
  post_study_work_visa?: boolean;
  post_study_work_duration?: string;
  required_tests?: string[];
  scholarship_availability?: string;
  visa_processing_time?: string;
  official_education_website?: string;
  embassy_website?: string;
}

export interface ServiceApiRecord {
  id: string;
  slug: string;
  title: string;
  description: string;
  short_description: string;
  category: string;
  price: string;
  currency: string;
  duration: string;
  features: string[];
  is_featured: boolean;
  image: string | null;
}

export interface UserApiRecord {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  phone_number: string;
  role: string;
  is_verified: boolean;
  date_joined: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
  withCredentials: true,
});

let csrfToken: string | null = null;
let currentUser: UserApiRecord | null = null;

async function getCsrfToken(): Promise<string> {
  if (!csrfToken) {
    const response = await axios.get<{ csrfToken: string }>(
      `${API_BASE_URL}/auth/csrf/`,
      { withCredentials: true, timeout: 30000 }
    );
    csrfToken = response.data.csrfToken;
  }
  return csrfToken;
}

export const clearAuth = (): void => {
  currentUser = null;
  csrfToken = null;
};

apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const method = config.method?.toUpperCase();
    if (method && !['GET', 'HEAD', 'OPTIONS', 'TRACE'].includes(method)) {
      config.headers.set('X-CSRFToken', await getCsrfToken());
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

let isRefreshing = false;
let failedQueue: Array<{
  resolve: () => void;
  reject: (reason: unknown) => void;
}> = [];

function processQueue(error: unknown = null): void {
  failedQueue.forEach((request) => {
    if (error) request.reject(error);
    else request.resolve();
  });
  failedQueue = [];
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined;
    const url = originalRequest?.url ?? '';
    const isSessionRequest = [
      '/auth/csrf/',
      '/auth/login/',
      '/auth/register/',
      '/auth/logout/',
      '/auth/token/refresh/',
    ].some((path) => url.includes(path));

    if (
      error.response?.status !== 401
      || !originalRequest
      || originalRequest._retry
      || isSessionRequest
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;
    if (isRefreshing) {
      return new Promise<void>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then(() => apiClient(originalRequest));
    }

    isRefreshing = true;
    try {
      await api.auth.refreshToken();
      processQueue();
      return await apiClient(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError);
      clearAuth();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export const api = {
  auth: {
    register: async (data: {
      email: string;
      password: string;
      password2: string;
      first_name: string;
      last_name: string;
      phone_number?: string;
    }) => {
      const response = await apiClient.post<{
        user: UserApiRecord;
        message: string;
      }>('/auth/register/', data);
      currentUser = response.data.user;
      return response.data;
    },

    login: async (data: { email: string; password: string }) => {
      const response = await apiClient.post<{
        user: UserApiRecord;
        message: string;
      }>('/auth/login/', data);
      currentUser = response.data.user;
      return response.data;
    },

    logout: async () => {
      try {
        await apiClient.post('/auth/logout/', {});
      } finally {
        clearAuth();
      }
    },

    refreshToken: async () => {
      const response = await apiClient.post<{ message: string }>(
        '/auth/token/refresh/',
        {}
      );
      return response.data;
    },

    getCurrentUser: async () => {
      const response = await apiClient.get<UserApiRecord>('/auth/me/');
      currentUser = response.data;
      return response.data;
    },

    updateProfile: async (data: {
      first_name?: string;
      last_name?: string;
      phone_number?: string;
    }) => {
      const response = await apiClient.patch<UserApiRecord>('/auth/me/', data);
      currentUser = response.data;
      return response.data;
    },
  },

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
      const response = await apiClient.get<PaginatedResponse<ScholarshipApiRecord>>(
        '/scholarships/',
        { params }
      );
      return response.data;
    },

    get: async (slug: string) => {
      const response = await apiClient.get<ScholarshipApiRecord>(
        `/scholarships/${slug}/`
      );
      return response.data;
    },
  },

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
      const response = await apiClient.get<PaginatedResponse<UniversityApiRecord>>(
        '/universities/',
        { params }
      );
      return response.data;
    },

    get: async (slug: string) => {
      const response = await apiClient.get<UniversityApiRecord>(
        `/universities/${slug}/`
      );
      return response.data;
    },
  },

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
      const response = await apiClient.get<PaginatedResponse<DestinationApiRecord>>(
        '/destinations/',
        { params }
      );
      return response.data;
    },

    get: async (slug: string) => {
      const response = await apiClient.get<DestinationApiRecord>(
        `/destinations/${slug}/`
      );
      return response.data;
    },
  },

  services: {
    list: async (params?: {
      category?: string;
      is_featured?: boolean;
      search?: string;
      ordering?: string;
      page?: number;
    }) => {
      const response = await apiClient.get<PaginatedResponse<ServiceApiRecord>>(
        '/services/',
        { params }
      );
      return response.data;
    },

    get: async (slug: string) => {
      const response = await apiClient.get<ServiceApiRecord>(
        `/services/${slug}/`
      );
      return response.data;
    },
  },
};

export function getCurrentUserFromStorage(): UserApiRecord | null {
  return currentUser;
}

export function isAuthenticated(): boolean {
  return currentUser !== null;
}

export default apiClient;
