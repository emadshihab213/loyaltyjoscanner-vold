// src/lib/apiService.ts
import {
  LoginRequest,
  LoginResponse,
  GetMemberByBarcodeResponse,
  AddPointsResponse,
  BurnPointsResponse,
} from "@/types/api";
import { storage } from "./storage";

const API_BASE_URL =
  (process.env.EXPO_PUBLIC_API_BASE_URL || "https://r2wm1mmh-8081.inc1.devtunnels.ms/api")
    .replace(/\/$/, "");

class ApiService {
  private token: string | null = null;

  constructor() {
    // best-effort restore (non-blocking)
    void this.restoreToken();
  }

  private async restoreToken() {
    try {
      const t = await storage.getItem("auth_token");
      if (t) this.token = t;
    } catch (e) {
      console.warn("Failed to load token:", e);
    }
  }

  async setToken(token: string) {
    this.token = token;
    try {
      await storage.setItem("auth_token", token);
    } catch {}
  }

  async clearToken() {
    this.token = null;
    try {
      await storage.removeItem("auth_token");
    } catch {}
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string> | undefined),
    };
    if (this.token) headers.Authorization = `Bearer ${this.token}`;

    const res = await fetch(url, { ...options, headers });

    let body: any = null;
    try {
      body = await res.json();
    } catch {
      body = { message: "Unable to parse server response." };
    }

    if (!res.ok) {
      const msg = body?.message || body?.error || `HTTP ${res.status}`;
      throw new Error(msg);
    }

    return body as T;
  }

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const emailOrUsername =
      (credentials as any).emailOrUsername || (credentials as any).email || (credentials as any).username;

    if (!emailOrUsername) throw new Error("Please provide email or username.");
    if (!credentials.password) throw new Error("Please provide password.");

    const response = await this.request<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ emailOrUsername, password: credentials.password }),
    });

    if (!response?.token) throw new Error("Login failed: token missing in response.");
    await this.setToken(response.token);
    return response;
  }

  // PassKit member endpoints
  async getMemberByBarcode(decodeBarcodePayload: string): Promise<GetMemberByBarcodeResponse> {
    return this.request<GetMemberByBarcodeResponse>("/passkit/get-member-by-barcode", {
      method: "POST",
      body: JSON.stringify({ decodeBarcodePayload }),
    });
  }

  async addPoints(programId: string, memberId: string, points: number): Promise<AddPointsResponse> {
    return this.request<AddPointsResponse>("/passkit/add-points", {
      method: "POST",
      body: JSON.stringify({ programId, memberId, points }),
    });
  }

  async burnPoints(programId: string, memberId: string, points: number): Promise<BurnPointsResponse> {
    return this.request<BurnPointsResponse>("/passkit/burn-points", {
      method: "POST",
      body: JSON.stringify({ programId, memberId, points }),
    });
  }
}

export const apiService = new ApiService();
