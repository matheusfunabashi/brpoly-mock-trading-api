// Types defined locally based on OpenAPI spec (openapi.yaml)
// Since tsconfig paths are read-only, we define types here directly.

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

export interface DevCompletePixDepositResponse {
  deposit: PixDeposit;
  balance: Balance;
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

export interface PositionsResponse {
  items: Position[];
}

export interface PaginatedMarkets {
  items: Market[];
  nextCursor: string | null;
}

export interface PaginatedOrders {
  items: Order[];
  nextCursor: string | null;
}

export interface PaginatedTrades {
  items: Trade[];
  nextCursor: string | null;
}

export interface PaginatedKycCases {
  items: KycCase[];
  nextCursor: string | null;
}

export interface PaginatedUsers {
  items: User[];
  nextCursor: string | null;
}

export interface AuditEvent {
  id: string;
  actorUserId: string;
  action: string;
  targetType: string;
  targetId: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface PaginatedAudit {
  items: AuditEvent[];
  nextCursor: string | null;
}

export interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

export type AuthResponse = { user: User; token: string };

export type RegisterRequest = {
  email: string;
  password: string;
  fullName: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type PlaceOrderRequest =
  | {
      marketId: string;
      outcomeId: string;
      side: OrderSide;
      type: 'limit';
      price: DecimalString;
      amount: DecimalString;
    }
  | {
      marketId: string;
      outcomeId: string;
      side: OrderSide;
      type: 'market';
      amount: DecimalString;
    };

export type CreatePixDepositRequest = {
  amountBrl: DecimalString;
};

export type CreatePixWithdrawalRequest = {
  amountBrl: DecimalString;
  pixKeyType: PixKeyType;
  pixKeyValue: string;
};

export type CreateCryptoDepositAddressRequest = {
  asset: string;
  chain: string;
};

export type CreateCryptoWithdrawalRequest = {
  amount: DecimalString;
  asset: string;
  chain: string;
  address: string;
};

export type KycStatusResponse = {
  status: KycStatus;
  updatedAt: string;
  reason?: string;
};
