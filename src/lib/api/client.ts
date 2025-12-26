import type {
  AuthResponse,
  Balance,
  LoginRequest,
  Market,
  Order,
  OrderbookSnapshot,
  PaginatedMarkets,
  PaginatedOrders,
  PaginatedTrades,
  PlaceOrderRequest,
  PositionsResponse,
  RegisterRequest,
  User,
  CreatePixDepositRequest,
  PixDeposit,
  KycCase,
  CreatePixWithdrawalRequest,
  PixWithdrawal,
  CreateCryptoDepositAddressRequest,
  CryptoDeposit,
  CreateCryptoWithdrawalRequest,
  CryptoWithdrawal,
  KycStatusResponse,
} from './types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

class ApiClient {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('auth_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        error: { code: 'UNKNOWN', message: 'An error occurred' },
      }));
      throw new Error(error.error?.message || 'Request failed');
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return response.json();
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }

  getToken() {
    return this.token;
  }

  // Auth
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    this.setToken(response.token);
    return response;
  }

  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    this.setToken(response.token);
    return response;
  }

  async me(): Promise<User> {
    return this.request<User>('/auth/me');
  }

  async logout(): Promise<void> {
    await this.request<void>('/auth/logout', { method: 'POST' });
    this.setToken(null);
  }

  // Markets
  async listMarkets(params?: {
    status?: string;
    q?: string;
    category?: string;
    limit?: number;
    cursor?: string;
  }): Promise<PaginatedMarkets> {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set('status', params.status);
    if (params?.q) searchParams.set('q', params.q);
    if (params?.category) searchParams.set('category', params.category);
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.cursor) searchParams.set('cursor', params.cursor);

    const query = searchParams.toString();
    return this.request<PaginatedMarkets>(`/markets${query ? `?${query}` : ''}`);
  }

  async getMarket(marketId: string): Promise<Market> {
    return this.request<Market>(`/markets/${marketId}`);
  }

  async getOrderbook(marketId: string, outcomeId: string): Promise<OrderbookSnapshot> {
    return this.request<OrderbookSnapshot>(
      `/markets/${marketId}/orderbook?outcomeId=${outcomeId}`
    );
  }

  async listTrades(
    marketId: string,
    params?: { limit?: number; cursor?: string }
  ): Promise<PaginatedTrades> {
    const searchParams = new URLSearchParams();
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.cursor) searchParams.set('cursor', params.cursor);

    const query = searchParams.toString();
    return this.request<PaginatedTrades>(
      `/markets/${marketId}/trades${query ? `?${query}` : ''}`
    );
  }

  // Orders
  async placeOrder(data: PlaceOrderRequest): Promise<Order> {
    return this.request<Order>('/orders', {
      method: 'POST',
      headers: {
        'Idempotency-Key': crypto.randomUUID(),
      },
      body: JSON.stringify(data),
    });
  }

  async listOrders(params?: {
    status?: string;
    marketId?: string;
    limit?: number;
    cursor?: string;
  }): Promise<PaginatedOrders> {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set('status', params.status);
    if (params?.marketId) searchParams.set('marketId', params.marketId);
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.cursor) searchParams.set('cursor', params.cursor);

    const query = searchParams.toString();
    return this.request<PaginatedOrders>(`/orders${query ? `?${query}` : ''}`);
  }

  async cancelOrder(orderId: string): Promise<Order> {
    return this.request<Order>(`/orders/${orderId}/cancel`, { method: 'POST' });
  }

  // Positions
  async listPositions(): Promise<PositionsResponse> {
    return this.request<PositionsResponse>('/positions');
  }

  // Wallet
  async getBalance(): Promise<Balance> {
    return this.request<Balance>('/wallet/balance');
  }

  async createPixDeposit(data: CreatePixDepositRequest): Promise<PixDeposit> {
    return this.request<PixDeposit>('/wallet/deposits/pix/create', {
      method: 'POST',
      headers: {
        'Idempotency-Key': crypto.randomUUID(),
      },
      body: JSON.stringify(data),
    });
  }

  async getPixDeposit(depositId: string): Promise<PixDeposit> {
    return this.request<PixDeposit>(`/wallet/deposits/pix/${depositId}`);
  }

  async createPixWithdrawal(data: CreatePixWithdrawalRequest): Promise<PixWithdrawal> {
    return this.request<PixWithdrawal>('/wallet/withdrawals/pix/create', {
      method: 'POST',
      headers: {
        'Idempotency-Key': crypto.randomUUID(),
      },
      body: JSON.stringify(data),
    });
  }

  async createCryptoDepositAddress(
    data: CreateCryptoDepositAddressRequest
  ): Promise<CryptoDeposit> {
    return this.request<CryptoDeposit>('/wallet/deposits/crypto/createAddress', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getCryptoDeposit(depositId: string): Promise<CryptoDeposit> {
    return this.request<CryptoDeposit>(`/wallet/deposits/crypto/${depositId}`);
  }

  async createCryptoWithdrawal(data: CreateCryptoWithdrawalRequest): Promise<CryptoWithdrawal> {
    return this.request<CryptoWithdrawal>('/wallet/withdrawals/crypto/create', {
      method: 'POST',
      headers: {
        'Idempotency-Key': crypto.randomUUID(),
      },
      body: JSON.stringify(data),
    });
  }

  // KYC
  async startKyc(): Promise<KycCase> {
    return this.request<KycCase>('/kyc/start', { method: 'POST' });
  }

  async getKycStatus(): Promise<KycStatusResponse> {
    return this.request('/kyc/status');
  }
}

export const apiClient = new ApiClient();
