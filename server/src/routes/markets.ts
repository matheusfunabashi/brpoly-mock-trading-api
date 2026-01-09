import { FastifyPluginAsync } from "fastify";
import { prisma } from "../lib/prisma.js";
import { serializeMarket, serializeTrade } from "../lib/serializers.js";
import { sendError } from "../lib/errors.js";
import { z } from "zod";

const listQuery = z.object({
  status: z.string().optional(),
  q: z.string().optional(),
  category: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  cursor: z.string().optional(),
});

const orderbookMap: Record<
  string,
  { bids: { price: string; amount: string }[]; asks: { price: string; amount: string }[] }
> = {
  "market_lula_2026:yes": {
    bids: [
      { price: "0.40", amount: "500" },
      { price: "0.39", amount: "800" },
      { price: "0.38", amount: "1200" },
    ],
    asks: [
      { price: "0.42", amount: "450" },
      { price: "0.43", amount: "700" },
      { price: "0.44", amount: "550" },
    ],
  },
  "market_lula_2026:no": {
    bids: [
      { price: "0.58", amount: "600" },
      { price: "0.57", amount: "700" },
    ],
    asks: [
      { price: "0.60", amount: "400" },
      { price: "0.61", amount: "500" },
    ],
  },
  "market_selic_2025:yes": {
    bids: [
      { price: "0.21", amount: "400" },
      { price: "0.20", amount: "800" },
    ],
    asks: [
      { price: "0.23", amount: "500" },
      { price: "0.24", amount: "500" },
    ],
  },
  "market_selic_2025:no": {
    bids: [
      { price: "0.75", amount: "300" },
      { price: "0.74", amount: "400" },
    ],
    asks: [
      { price: "0.77", amount: "200" },
      { price: "0.78", amount: "300" },
    ],
  },
  "market_dolar_6:yes": {
    bids: [
      { price: "0.62", amount: "200" },
      { price: "0.60", amount: "400" },
    ],
    asks: [
      { price: "0.65", amount: "300" },
      { price: "0.66", amount: "300" },
    ],
  },
  "market_dolar_6:no": {
    bids: [
      { price: "0.33", amount: "250" },
      { price: "0.30", amount: "500" },
    ],
    asks: [
      { price: "0.35", amount: "200" },
      { price: "0.36", amount: "400" },
    ],
  },
};

export const marketsRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get("/markets", async (request) => {
    const parsed = listQuery.parse(request.query);
    const limit = parsed.limit ?? 20;

    const markets = await prisma.market.findMany({
      where: {
        status: parsed.status as any | undefined,
        category: parsed.category || undefined,
        OR: parsed.q
          ? [
              { title: { contains: parsed.q, mode: "insensitive" } },
              { description: { contains: parsed.q, mode: "insensitive" } },
            ]
          : undefined,
      },
      include: {
        outcomes: true,
        prices: true,
      },
      take: limit,
    });

    return {
      items: markets.map(serializeMarket),
      nextCursor: null,
    };
  });

  fastify.get("/markets/:marketId", async (request, reply) => {
    const marketId = (request.params as { marketId: string }).marketId;
    const market = await prisma.market.findUnique({
      where: { id: marketId },
      include: { outcomes: true, prices: true },
    });
    if (!market) {
      return sendError(reply, 404, "NOT_FOUND", "Market not found");
    }
    return serializeMarket(market);
  });

  fastify.get("/markets/:marketId/orderbook", async (request, reply) => {
    const { marketId } = request.params as { marketId: string };
    const { outcomeId } = request.query as { outcomeId?: string };

    if (!outcomeId) {
      return sendError(reply, 400, "INVALID_INPUT", "outcomeId is required");
    }

    const marketExists = await prisma.market.findFirst({
      where: { id: marketId, outcomes: { some: { id: outcomeId } } },
    });
    if (!marketExists) {
      return sendError(reply, 404, "NOT_FOUND", "Market not found");
    }

    const snapshot = orderbookMap[`${marketId}:${outcomeId}`];
    if (!snapshot) {
      return { bids: [], asks: [] };
    }
    return snapshot;
  });

  fastify.get("/markets/:marketId/trades", async (request, reply) => {
    const { marketId } = request.params as { marketId: string };
    const market = await prisma.market.findUnique({ where: { id: marketId } });
    if (!market) {
      return sendError(reply, 404, "NOT_FOUND", "Market not found");
    }

    const trades = await prisma.trade.findMany({
      where: { marketId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return {
      items: trades.map(serializeTrade),
      nextCursor: null,
    };
  });
};


