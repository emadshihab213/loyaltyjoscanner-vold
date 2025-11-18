export interface LoginRequest {
  emailOrUsername: string;
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

export interface MemberData {
  id: string;
  externalId?: string;
  points: number;
  status?: number;
}

export interface GetMemberByBarcodeResponse {
  success: boolean;
  data: {
    memberId: string;
    programId: string;
    memberData: MemberData;
  };
}

export interface AddPointsResponse {
  success: boolean;
  result: {
    memberId: string;
    points: number;
    tierPoints: number;
    secondaryPoints: number;
  };
}

export interface BurnPointsResponse {
  success: boolean;
  result: {
    memberId: string;
    points: number;
    tierPoints: number;
    secondaryPoints: number;
  };
}