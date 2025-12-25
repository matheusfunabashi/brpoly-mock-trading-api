// Types derived from OpenAPI spec

export type DecimalString = string;

export type Role = 'customer' | 'admin';
export type MarketStatus = 'draft' | 'open' | 'closed' | 'resolved' | 'canceled';
export type OrderStatus = 'open' | 'partial' | 'filled' | 'canceled' | 'expired';
export type KycStatus = 'not_started' | 'pending' | 'approved' | 'rejected' | 'manual_review';
export type OrderSide = 'buy' | 'sell';
export type OrderType = 'limit' | 'market';
export type PixKeyType = 'cpf' | 'cnpj' | 'email' | 'phone' | 'evp';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  kycStatus: KycStatus;
  createdAt: string;
}

export interface Outcome {
  id: string;
  title: string;
}

export interface MarketPrice {
  outcomeId: string;
  price: DecimalString;
}

export interface Market {
  id: string;
  title: string;
  description: string;
  category: string;
  status: MarketStatus;
  closeTime: string;
  outcomes: Outcome[];
  currentPrices: MarketPrice[];
  volumeBrl: DecimalString;
}

export interface Order {
  id: string;
  marketId: string;
  outcomeId: string;
  side: OrderSide;
  type: OrderType;
  price?: DecimalString;
  amount: DecimalString;
  filledAmount: DecimalString;
  status: OrderStatus;
  createdAt: string;
}

export interface Trade {
  id: string;
  marketId: string;
  outcomeId: string;
  price: DecimalString;
  amount: DecimalString;
  takerSide: OrderSide;
  createdAt: string;
}

export interface Position {
  marketId: string;
  outcomeId: string;
  size: DecimalString;
  avgPrice: DecimalString;
  pnlBrl: DecimalString;
  lastPrice: DecimalString;
}

export interface Balance {
  brlAvailable: DecimalString;
  brlReserved: DecimalString;
  totalBrl: DecimalString;
  updatedAt: string;
}

export interface PixDeposit {
  depositId: string;
  status: 'pending' | 'completed' | 'expired' | 'failed';
  qrCodeText: string;
  qrCodeImageUrl?: string;
  expiresAt: string;
  amountBrl: DecimalString;
}

export interface PixWithdrawal {
  withdrawalId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: string;
  amountBrl: DecimalString;
  pixKeyType: PixKeyType;
  pixKeyValue: string;
}

export interface CryptoDeposit {
  depositId: string;
  address: string;
  asset: string;
  chain: string;
  status: 'pending' | 'confirmed';
  confirmations: number;
}

export interface CryptoWithdrawal {
  withdrawalId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  amount: DecimalString;
  asset: string;
  chain: string;
  address: string;
}

export interface KycCase {
  kycCaseId: string;
  provider: string;
  status: KycStatus;
  redirectUrl?: string;
  updatedAt: string;
  reason?: string;
}

export interface OrderbookLevel {
  price: DecimalString;
  amount: DecimalString;
}

export interface OrderbookSnapshot {
  bids: OrderbookLevel[];
  asks: OrderbookLevel[];
}

export interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

// Paginated responses
export interface CursorPage<T> {
  items: T[];
  nextCursor: string | null;
}

export type PaginatedMarkets = CursorPage<Market>;
export type PaginatedOrders = CursorPage<Order>;
export type PaginatedTrades = CursorPage<Trade>;

export interface PositionsResponse {
  items: Position[];
}

// Auth responses
export interface AuthResponse {
  user: User;
  token: string;
}

// Request types
export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface PlaceOrderRequest {
  marketId: string;
  outcomeId: string;
  side: OrderSide;
  type: OrderType;
  price?: DecimalString;
  amount: DecimalString;
}

export interface CreatePixDepositRequest {
  amountBrl: DecimalString;
}

export interface CreatePixWithdrawalRequest {
  amountBrl: DecimalString;
  pixKeyType: PixKeyType;
  pixKeyValue: string;
}
