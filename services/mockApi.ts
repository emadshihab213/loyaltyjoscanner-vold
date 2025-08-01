import { LoginRequest, LoginResponse, ScanResponse, StampResponse, RedeemResponse, Customer } from '@/types/api';

// Mock data
const MOCK_STAFF = {
  id: '1',
  name: 'Demo Staff',
  phone: '+1234567890',
  businessName: 'Demo Business'
};

const MOCK_CUSTOMERS: Customer[] = [
  {
    id: '1',
    name: 'John Doe',
    phone: '+1987654321',
    currentStamps: 3,
    maxStamps: 10,
    canRedeem: false
  },
  {
    id: '2',
    name: 'Jane Smith',
    phone: '+1555123456',
    currentStamps: 10,
    maxStamps: 10,
    canRedeem: true
  },
  {
    id: '3',
    name: 'Bob Johnson',
    phone: '+1444567890',
    currentStamps: 7,
    maxStamps: 10,
    canRedeem: false
  }
];

class MockApiService {
  private token: string | null = null;
  private customers: Customer[] = [...MOCK_CUSTOMERS];

  setToken(token: string) {
    this.token = token;
  }

  clearToken() {
    this.token = null;
  }

  private delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    await this.delay(1000); // Simulate network delay

    if (credentials.phone === '+1234567890' && credentials.password === 'staff123') {
      const token = 'mock-jwt-token-' + Date.now();
      this.setToken(token);
      return {
        token,
        staff: MOCK_STAFF
      };
    }

    throw new Error('Invalid phone number or password');
  }

  async scanCustomer(qrData: string): Promise<ScanResponse> {
    await this.delay(800);

    if (!this.token) {
      throw new Error('Not authenticated');
    }

    // Mock QR data parsing - in real app this would decode actual QR data
    const customerId = qrData.includes('customer') ? qrData.split('-')[1] || '1' : '1';
    const customer = this.customers.find(c => c.id === customerId);

    if (customer) {
      return {
        success: true,
        customer
      };
    }

    throw new Error('Customer not found');
  }

  async addStamp(customerId: string): Promise<StampResponse> {
    await this.delay(600);

    if (!this.token) {
      throw new Error('Not authenticated');
    }

    const customerIndex = this.customers.findIndex(c => c.id === customerId);
    if (customerIndex === -1) {
      throw new Error('Customer not found');
    }

    const customer = { ...this.customers[customerIndex] };
    
    if (customer.currentStamps < customer.maxStamps) {
      customer.currentStamps += 1;
      customer.canRedeem = customer.currentStamps >= customer.maxStamps;
      this.customers[customerIndex] = customer;

      return {
        success: true,
        customer,
        message: `Stamp added! ${customer.currentStamps}/${customer.maxStamps} stamps collected.`
      };
    }

    throw new Error('Customer already has maximum stamps');
  }

  async redeemReward(customerId: string): Promise<RedeemResponse> {
    await this.delay(800);

    if (!this.token) {
      throw new Error('Not authenticated');
    }

    const customerIndex = this.customers.findIndex(c => c.id === customerId);
    if (customerIndex === -1) {
      throw new Error('Customer not found');
    }

    const customer = { ...this.customers[customerIndex] };
    
    if (customer.canRedeem && customer.currentStamps >= customer.maxStamps) {
      customer.currentStamps = 0;
      customer.canRedeem = false;
      this.customers[customerIndex] = customer;

      return {
        success: true,
        customer,
        message: 'Reward redeemed successfully! Stamps reset to 0.'
      };
    }

    throw new Error('Customer is not eligible for reward redemption');
  }
}

export const mockApiService = new MockApiService();