// src/config/api.ts
export const API_BASE = import.meta.env.VITE_API_BASE_URL;

export const getAuthHeader = () => ({
    Authorization: `Bearer ${localStorage.getItem('authToken')}`
});