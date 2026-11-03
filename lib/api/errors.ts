import axios from 'axios';

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (!axios.isAxiosError(error)) return fallback;

  const data: unknown = error.response?.data;
  if (typeof data === 'string') return data;
  if (!data || typeof data !== 'object') return fallback;

  for (const value of Object.values(data as Record<string, unknown>)) {
    if (typeof value === 'string') return value;
    if (Array.isArray(value)) {
      const message = value.find((item): item is string => typeof item === 'string');
      if (message) return message;
    }
  }
  return fallback;
}
