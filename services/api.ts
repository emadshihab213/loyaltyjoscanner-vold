import { LoginRequest, LoginResponse, ScanResponse, StampResponse, RedeemResponse, ApiError } from '@/types/api';
import { mockApiService } from './mockApi';

const API_BASE_URL = 'http://localhost:5001/api';

class ApiService {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
  }

  clearToken() {
    this.token = null;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Network error' }));
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network request failed');
    }
  }

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    // Always use mock API for demo
    const response = await mockApiService.login(credentials);
    this.setToken(response.token);
    return response;
  }

  async scanCustomer(qrData: string): Promise<ScanResponse> {
    return mockApiService.scanCustomer(qrData);
  }

  async addStamp(customerId: string): Promise<StampResponse> {
    return mockApiService.addStamp(customerId);
  }

  async redeemReward(customerId: string): Promise<RedeemResponse> {
    return mockApiService.redeemReward(customerId);
  }
}

export const apiService = new ApiService();