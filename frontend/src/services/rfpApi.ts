// API service for RFP monitoring backend integration
import type { RfpMonitoringRecord, RfpFormData, Payee, VesselPrincipal, Port } from '../types/rfp';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

// JWT Token management
class TokenManager {
  private static readonly ACCESS_TOKEN_KEY = 'authToken'; // Using existing key
  private static readonly REFRESH_TOKEN_KEY = 'refreshToken'; // Using existing key

  static setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
  }

  static getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  static getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  static clearTokens(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    // Also clear user-related data on logout
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userRoleName');
    localStorage.removeItem('userName');
    localStorage.removeItem('companyCode');
    localStorage.removeItem('selectedCompany');
  }

  static isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }
}

// API response wrapper type
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

// Login response type
interface LoginResponse {
  access: string;
  refresh: string;
  user: {
    id: number;
    full_name: string;
    email: string;
    role: {
      code: string;
      name: string;
    };
    companies: Array<{
      id: number;
      company_code: string;
    }>;
  };
}

// RFP Monitoring API endpoints
export class RfpApi {
  // Helper method to get headers with authentication
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

  // Helper method to handle authenticated requests
  private static async authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.getAuthHeaders(),
        ...options.headers,
      },
    });

    // If unauthorized, try to refresh token
    if (response.status === 401 && TokenManager.getRefreshToken()) {
      const refreshSuccess = await this.refreshToken();
      if (refreshSuccess) {
        // Retry the original request with new token
        return fetch(url, {
          ...options,
          headers: {
            ...this.getAuthHeaders(),
            ...options.headers,
          },
        });
      } else {
        // Clear tokens if refresh failed
        TokenManager.clearTokens();
        throw new Error('Authentication failed. Please log in again.');
      }
    }

    return response;
  }

  // Authentication methods
  static async login(email: string, password: string): Promise<ApiResponse<LoginResponse>> {
    try {
      const response = await fetch(`${API_BASE_URL}/user/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Store tokens
        TokenManager.setTokens(data.access, data.refresh);
      }
      
      return { success: response.ok, data };
    } catch (error) {
      return { success: false, data: {} as LoginResponse, error: (error as Error).message };
    }
  }

  static async refreshToken(): Promise<boolean> {
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

      if (response.ok) {
        const data = await response.json();
        TokenManager.setTokens(data.access, refreshToken);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  }

  static logout(): void {
    TokenManager.clearTokens();
  }

  static isAuthenticated(): boolean {
    return TokenManager.isAuthenticated();
  }

  // RFP Records CRUD operations
  static async getAllRfpRecords(): Promise<ApiResponse<RfpMonitoringRecord[]>> {
    try {
      const response = await this.authenticatedFetch(`${API_BASE_URL}/rfp-monitoring/`);
      const data = await response.json();
      return { success: response.ok, data };
    } catch (error) {
      return { success: false, data: [], error: (error as Error).message };
    }
  }

  static async getRfpRecord(expectedSeries: number): Promise<ApiResponse<RfpMonitoringRecord>> {
    try {
      const response = await this.authenticatedFetch(`${API_BASE_URL}/rfp-monitoring/${expectedSeries}/`);
      const data = await response.json();
      return { success: response.ok, data };
    } catch (error) {
      return { success: false, data: {} as RfpMonitoringRecord, error: (error as Error).message };
    }
  }

  static async createRfpRecord(formData: RfpFormData): Promise<ApiResponse<RfpMonitoringRecord>> {
    try {
      console.log('Creating RFP record with data:', JSON.stringify(formData, null, 2));
      const response = await this.authenticatedFetch(`${API_BASE_URL}/rfp-monitoring/`, {
        method: 'POST',
        body: JSON.stringify(formData),
      });
      
      console.log('Create response status:', response.status);
      console.log('Create response headers:', response.headers);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Create error response:', errorText);
        try {
          const errorJson = JSON.parse(errorText);
          return { success: false, data: {} as RfpMonitoringRecord, error: errorJson.detail || JSON.stringify(errorJson) };
        } catch {
          return { success: false, data: {} as RfpMonitoringRecord, error: `HTTP ${response.status}: ${errorText.substring(0, 200)}` };
        }
      }
      
      const data = await response.json();
      console.log('Created RFP record:', data);
      return { success: response.ok, data };
    } catch (error) {
      console.error('Create RFP record error:', error);
      return { success: false, data: {} as RfpMonitoringRecord, error: (error as Error).message };
    }
  }

  static async updateRfpRecord(expectedSeries: number, formData: Partial<RfpFormData>): Promise<ApiResponse<RfpMonitoringRecord>> {
    try {
      const response = await this.authenticatedFetch(`${API_BASE_URL}/rfp-monitoring/${expectedSeries}/`, {
        method: 'PATCH',
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      return { success: response.ok, data };
    } catch (error) {
      return { success: false, data: {} as RfpMonitoringRecord, error: (error as Error).message };
    }
  }

  static async deleteRfpRecord(expectedSeries: number): Promise<ApiResponse<null>> {
    try {
      const response = await this.authenticatedFetch(`${API_BASE_URL}/rfp-monitoring/${expectedSeries}/`, {
        method: 'DELETE',
      });
      return { success: response.ok, data: null };
    } catch (error) {
      return { success: false, data: null, error: (error as Error).message };
    }
  }

  // Foreign key entities endpoints
  static async getPayees(): Promise<ApiResponse<Payee[]>> {
    try {
      const response = await this.authenticatedFetch(`${API_BASE_URL}/payees/`);
      const data = await response.json();
      return { success: response.ok, data };
    } catch (error) {
      return { success: false, data: [], error: (error as Error).message };
    }
  }

  static async getVesselPrincipals(): Promise<ApiResponse<VesselPrincipal[]>> {
    try {
      const response = await this.authenticatedFetch(`${API_BASE_URL}/vessel-principals/`);
      const data = await response.json();
      return { success: response.ok, data };
    } catch (error) {
      return { success: false, data: [], error: (error as Error).message };
    }
  }

  static async getPorts(): Promise<ApiResponse<Port[]>> {
    try {
      const response = await this.authenticatedFetch(`${API_BASE_URL}/ports/`);
      const data = await response.json();
      return { success: response.ok, data };
    } catch (error) {
      return { success: false, data: [], error: (error as Error).message };
    }
  }

  // Utility methods for form data conversion
  static convertRecordToFormData(record: RfpMonitoringRecord): RfpFormData {
    // Handle both object and ID formats for foreign keys
    const getPayeeId = () => {
      if (typeof record.payee === 'string') return record.payee;
      if (typeof record.payee === 'object' && record.payee?.payee_id) return record.payee.payee_id;
      if (record.payee_data?.payee_id) return record.payee_data.payee_id;
      return undefined;
    };

    const getVesselPrincipalId = () => {
      if (typeof record.vessel_principal === 'string') return record.vessel_principal;
      if (typeof record.vessel_principal === 'object' && record.vessel_principal?.vessel_principal_id) return record.vessel_principal.vessel_principal_id;
      if (record.vessel_principal_data?.vessel_principal_id) return record.vessel_principal_data.vessel_principal_id;
      return undefined;
    };

    const getPortId = () => {
      if (typeof record.port === 'string') return record.port;
      if (typeof record.port === 'object' && record.port?.port_id) return record.port.port_id;
      if (record.port_data?.port_id) return record.port_data.port_id;
      return undefined;
    };

    return {
      expected_series: record.expected_series,
      cwr_processed: record.cwr_processed,
      cwr_usage: record.cwr_usage,
      trampsys_status: record.trampsys_status,
      status_cwr: record.status_cwr,
      remarks_cwr: record.remarks_cwr,
      eta: record.eta,
      etd: record.etd,
      payee: getPayeeId(),
      vessel_principal: getVesselPrincipalId(),
      port: getPortId(),
      voy: record.voy,
    };
  }
}

// Helper function for error handling
export const handleApiError = (error: ApiResponse<any>) => {
  if (!error.success) {
    console.error('API Error:', error.error || 'Unknown error');
    return error.error || 'An error occurred while processing your request';
  }
  return null;
};

// Export TokenManager for use in components
export { TokenManager };

// Export types for external use
export type { LoginResponse, ApiResponse };