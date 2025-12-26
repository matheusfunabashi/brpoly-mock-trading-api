import type { components } from '@api-types';

type Schemas = components['schemas'];

export type DecimalString = Schemas['DecimalString'];
export type Role = Schemas['Role'];
export type MarketStatus = Schemas['MarketStatus'];
export type OrderStatus = Schemas['OrderStatus'];
export type KycStatus = Schemas['KycStatus'];
export type OrderSide = 'buy' | 'sell';
export type OrderType = 'limit' | 'market';
export type PixKeyType = 'cpf' | 'cnpj' | 'email' | 'phone' | 'evp';

export type User = Schemas['User'];
export type Outcome = Schemas['Outcome'];
export type MarketPrice = Schemas['MarketPrice'];
export type Market = Schemas['Market'];
export type Order = Schemas['Order'];
export type Trade = Schemas['Trade'];
export type Position = Schemas['Position'];
export type Balance = Schemas['Balance'];
export type PixDeposit = Schemas['PixDeposit'];
export type PixWithdrawal = Schemas['PixWithdrawal'];
export type CryptoDeposit = Schemas['CryptoDeposit'];
export type CryptoWithdrawal = Schemas['CryptoWithdrawal'];
export type KycCase = Schemas['KycCase'];
export type OrderbookLevel = Schemas['OrderbookLevel'];
export type OrderbookSnapshot = Schemas['OrderbookSnapshot'];
export type PositionsResponse = Schemas['PositionsResponse'];
export type PaginatedMarkets = Schemas['PaginatedMarkets'];
export type PaginatedOrders = Schemas['PaginatedOrders'];
export type PaginatedTrades = Schemas['PaginatedTrades'];
export type PaginatedKycCases = Schemas['PaginatedKycCases'];
export type PaginatedUsers = Schemas['PaginatedUsers'];
export type PaginatedAudit = Schemas['PaginatedAudit'];

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
