// src/config/api.ts
export const API_BASE = import.meta.env.VITE_API_BASE_URL;

export const getAuthHeader = () => {
  const token = localStorage.getItem('authToken');

  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    'Content-Type': 'application/json', // ✅ REQUIRED
  };
};