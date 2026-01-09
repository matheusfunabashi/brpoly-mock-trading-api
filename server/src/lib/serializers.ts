import {
  Market,
  MarketPrice,
  Outcome,
  Order,
  Position,
  Trade,
  User,
  WalletBalance,
  PixDeposit,
} from "@prisma/client";
import { decimalToString } from "./format.js";

export function serializeUser(user: User) {
  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
    kycStatus: user.kycStatus,
    createdAt: user.createdAt.toISOString(),
  };
}

export function serializeMarket(
  market: Market & { outcomes: Outcome[]; prices: MarketPrice[] }
) {
  return {
    id: market.id,
    title: market.title,
    description: market.description,
    category: market.category,
    status: market.status,
    closeTime: market.closeTime.toISOString(),
    outcomes: market.outcomes.map((o) => ({ id: o.id, title: o.title })),
    currentPrices: market.prices.map((p) => ({
      outcomeId: p.outcomeId,
      price: decimalToString(p.price),
    })),
    volumeBrl: decimalToString(market.volumeBrl),
  };
}

export function serializeOrder(order: Order) {
  return {
    id: order.id,
    marketId: order.marketId,
    outcomeId: order.outcomeId,
    side: order.side,
    type: order.type,
    price: order.price !== null ? decimalToString(order.price) : undefined,
    amount: decimalToString(order.amount),
    filledAmount: decimalToString(order.filledAmount),
    status: order.status,
    createdAt: order.createdAt.toISOString(),
  };
}

export function serializeTrade(trade: Trade) {
  return {
    id: trade.id,
    marketId: trade.marketId,
    outcomeId: trade.outcomeId,
    price: decimalToString(trade.price),
    amount: decimalToString(trade.amount),
    takerSide: trade.takerSide,
    createdAt: trade.createdAt.toISOString(),
  };
}

export function serializePosition(position: Position) {
  return {
    marketId: position.marketId,
    outcomeId: position.outcomeId,
    size: decimalToString(position.size),
    avgPrice: decimalToString(position.avgPrice),
    pnlBrl: decimalToString(position.pnlBrl),
    lastPrice: decimalToString(position.lastPrice),
  };
}

export function serializeBalance(balance: WalletBalance) {
  return {
    brlAvailable: decimalToString(balance.brlAvailable),
    brlReserved: decimalToString(balance.brlReserved),
    totalBrl: decimalToString(balance.totalBrl),
    updatedAt: balance.updatedAt.toISOString(),
  };
}

export function serializePixDeposit(deposit: PixDeposit) {
  return {
    depositId: deposit.id,
    status: deposit.status,
    qrCodeText: deposit.qrCodeText,
    qrCodeImageUrl: deposit.qrCodeImageUrl ?? undefined,
    expiresAt: deposit.expiresAt.toISOString(),
    amountBrl: decimalToString(deposit.amountBrl),
  };
}


