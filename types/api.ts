export interface LoginRequest {
  phone: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  staff: {
    id: string;
    name: string;
    phone: string;
    businessName: string;
  };
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  currentStamps: number;
  maxStamps: number;
  canRedeem: boolean;
}

export interface ScanResponse {
  success: boolean;
  customer: Customer;
  message?: string;
}

export interface StampResponse {
  success: boolean;
  customer: Customer;
  message: string;
}

export interface RedeemResponse {
  success: boolean;
  customer: Customer;
  message: string;
}

export interface ApiError {
  message: string;
  status?: number;
}