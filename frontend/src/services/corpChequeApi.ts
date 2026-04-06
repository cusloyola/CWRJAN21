import { TokenManager } from './rfpApi';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export interface CorpInventory {
  id: number;
  start_date: string;
  beginning_balance: number;
  current_balance: number;
}

export interface DailyChequeUsage {
  id: number;
  inventory: number;
  date: string;
  cheques_used: number;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

class CorpChequeApiClient {
  private static async refreshToken(): Promise<boolean> {
    try {
      const refreshToken = TokenManager.getRefreshToken();
      if (!refreshToken) return false;

      const response = await fetch(`${API_BASE_URL}/user/token/refresh/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh: refreshToken }),
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      TokenManager.setTokens(data.access, refreshToken);
      return true;
    } catch {
      return false;
    }
  }

  private static async extractError(response: Response): Promise<string> {
    try {
      const data = await response.json();
      if (typeof data?.error === 'string' && data.error.trim()) return data.error;
      if (typeof data?.detail === 'string' && data.detail.trim()) return data.detail;
      if (typeof data?.message === 'string' && data.message.trim()) return data.message;
    } catch {
      // no-op
    }

    return `HTTP ${response.status}`;
  }

  private static getAuthHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    const token = TokenManager.getAccessToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  private static async authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.getAuthHeaders(),
        ...options.headers,
      },
    });

    if (response.status === 401 && TokenManager.getRefreshToken()) {
      const refreshed = await this.refreshToken();
      if (refreshed) {
        return fetch(url, {
          ...options,
          headers: {
            ...this.getAuthHeaders(),
            ...options.headers,
          },
        });
      }
    }

    return response;
  }

  static async getCorpInventories(): Promise<ApiResponse<CorpInventory[]>> {
    try {
      const response = await this.authenticatedFetch(`${API_BASE_URL}/inventories/`);
      if (!response.ok) {
        const errorMessage = await this.extractError(response);
        return { success: false, data: [], error: errorMessage };
      }
      const data = await response.json();
      return { success: response.ok, data };
    } catch (error) {
      return { success: false, data: [], error: (error as Error).message };
    }
  }

  static async getDailyChequeUsages(inventoryId: number): Promise<ApiResponse<DailyChequeUsage[]>> {
    try {
      const response = await this.authenticatedFetch(`${API_BASE_URL}/inventories/${inventoryId}/usages/`);
      if (!response.ok) {
        const errorMessage = await this.extractError(response);
        return { success: false, data: [], error: errorMessage };
      }
      const data = await response.json();
      return { success: response.ok, data };
    } catch (error) {
      return { success: false, data: [], error: (error as Error).message };
    }
  }

  static async saveDailyChequeUsage(
    inventoryId: number,
    payload: Pick<DailyChequeUsage, 'date' | 'cheques_used'>,
  ): Promise<ApiResponse<DailyChequeUsage>> {
    try {
      const response = await this.authenticatedFetch(`${API_BASE_URL}/inventories/${inventoryId}/usages/`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorMessage = await this.extractError(response);
        return { success: false, data: {} as DailyChequeUsage, error: errorMessage };
      }
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return { success: false, data: {} as DailyChequeUsage, error: (error as Error).message };
    }
  }

  static async deleteDailyChequeUsageByDate(inventoryId: number, date: string): Promise<ApiResponse<null>> {
    try {
      const response = await this.authenticatedFetch(
        `${API_BASE_URL}/inventories/${inventoryId}/usages/?date=${encodeURIComponent(date)}`,
        {
          method: 'DELETE',
        },
      );

      if (response.status === 404) {
        return { success: true, data: null };
      }

      if (!response.ok) {
        const errorMessage = await this.extractError(response);
        return { success: false, data: null, error: errorMessage };
      }

      return { success: true, data: null };
    } catch (error) {
      return { success: false, data: null, error: (error as Error).message };
    }
  }
}

export { CorpChequeApiClient };