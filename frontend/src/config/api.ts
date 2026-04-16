// src/config/api.ts
export const API_BASE = import.meta.env.VITE_API_BASE_URL;

export const getAuthHeader = (includeJsonContentType = true) => {
  const token = localStorage.getItem('authToken');

  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(includeJsonContentType ? { 'Content-Type': 'application/json' } : {}),
  };
};