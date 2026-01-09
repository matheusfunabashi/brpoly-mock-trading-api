import { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { sendError } from "../lib/errors.js";
import { handleIdempotent } from "../lib/idempotency.js";
import { serializeOrder } from "../lib/serializers.js";

const decimalString = z
  .string()
  .regex(/^-?\d+(\.\d+)?$/, "Must be a decimal string");

const probabilityString = z
  .string()
  .regex(/^(0(\.\d+)?|1(\.0+)?)$/, "Price must be between 0 and 1");

const limitOrderSchema = z.object({
  marketId: z.string(),
  outcomeId: z.string(),
  side: z.enum(["buy", "sell"]),
  type: z.literal("limit"),
  price: probabilityString,
  amount: decimalString,
});

const marketOrderSchema = z.object({
  marketId: z.string(),
  outcomeId: z.string(),
  side: z.enum(["buy", "sell"]),
  type: z.literal("market"),
  amount: decimalString,
});

const listQuery = z.object({
  status: z.string().optional(),
  marketId: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  cursor: z.string().optional(),
});

export const ordersRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.addHook("preHandler", fastify.authenticate);

  fastify.post("/orders", async (request, reply) => {
    const userId = (request.user as any)?.sub as string;
    const parsedLimit = limitOrderSchema.safeParse(request.body);
    const parsedMarketOrder = marketOrderSchema.safeParse(request.body);

    let payload: z.infer<typeof limitOrderSchema> | z.infer<typeof marketOrderSchema> | null = null;

    if (parsedLimit.success) {
      payload = parsedLimit.data;
    } else if (parsedMarketOrder.success) {
      payload = parsedMarketOrder.data;
    } else {
      return sendError(reply, 400, "INVALID_INPUT", "Invalid order payload");
    }
    const market = await prisma.market.findUnique({
      where: { id: payload.marketId },
      include: { outcomes: true },
    });
    if (!market) {
      return sendError(reply, 404, "NOT_FOUND", "Market not found");
    }
    const outcomeExists = market.outcomes.some((o) => o.id === payload.outcomeId);
    if (!outcomeExists) {
      return sendError(reply, 404, "NOT_FOUND", "Outcome not found");
    }

    if (payload.side === "sell") {
      return sendError(reply, 501, "NOT_IMPLEMENTED", "Sell orders are not implemented yet");
    }

    const amountDecimal = new Prisma.Decimal(payload.amount);
    if (amountDecimal.lte(0)) {
      return sendError(reply, 400, "INVALID_INPUT", "Amount must be greater than zero");
    }

    let priceDecimal: Prisma.Decimal;
    if (payload.type === "limit") {
      priceDecimal = new Prisma.Decimal(payload.price);
      if (priceDecimal.lte(0)) {
        return sendError(reply, 400, "INVALID_INPUT", "Price must be greater than zero");
      }
    } else {
      const marketPrice = await prisma.marketPrice.findFirst({
        where: { marketId: payload.marketId, outcomeId: payload.outcomeId },
      });
      if (!marketPrice) {
        return sendError(reply, 400, "MARKET_PRICE_NOT_FOUND", "Market price not available");
      }
      priceDecimal = new Prisma.Decimal(marketPrice.price);
    }

    const costBrl = amountDecimal.mul(priceDecimal);

    return handleIdempotent(
      request,
      reply,
      { userId, endpoint: "orders.place" },
      async () => {
        try {
          const order = await prisma.$transaction(async (tx) => {
            const balance = await tx.walletBalance.findUnique({ where: { userId } });
            if (!balance) {
              throw new Error("BALANCE_NOT_FOUND");
            }
            if (balance.brlAvailable.lt(costBrl)) {
              throw new Error("INSUFFICIENT_BALANCE");
            }

            await tx.walletBalance.update({
              where: { userId },
              data: {
                brlAvailable: { decrement: costBrl },
                totalBrl: { decrement: costBrl },
                updatedAt: new Date(),
              },
            });

            const createdOrder = await tx.order.create({
              data: {
                userId,
                marketId: payload.marketId,
                outcomeId: payload.outcomeId,
                side: "buy",
                type: payload.type as any,
                price: priceDecimal,
                amount: amountDecimal,
                filledAmount: amountDecimal,
                status: "filled",
              },
            });

            await tx.trade.create({
              data: {
                marketId: payload.marketId,
                outcomeId: payload.outcomeId,
                price: priceDecimal,
                amount: amountDecimal,
                takerSide: "buy",
                takerUserId: userId,
              },
            });

            const existingPosition = await tx.position.findFirst({
              where: {
                userId,
                marketId: payload.marketId,
                outcomeId: payload.outcomeId,
              },
            });

            if (existingPosition) {
              const newSize = existingPosition.size.add(amountDecimal);
              const newAvgPrice = existingPosition.avgPrice
                .mul(existingPosition.size)
                .add(priceDecimal.mul(amountDecimal))
                .div(newSize);

              await tx.position.update({
                where: { id: existingPosition.id },
                data: {
                  size: newSize,
                  avgPrice: newAvgPrice,
                  lastPrice: priceDecimal,
                  pnlBrl: existingPosition.pnlBrl,
                },
              });
            } else {
              await tx.position.create({
                data: {
                  userId,
                  marketId: payload.marketId,
                  outcomeId: payload.outcomeId,
                  size: amountDecimal,
                  avgPrice: priceDecimal,
                  pnlBrl: new Prisma.Decimal(0),
                  lastPrice: priceDecimal,
                },
              });
            }

            return createdOrder;
          });

          return { status: 201, body: serializeOrder(order) };
        } catch (error) {
          if (error instanceof Error) {
            if (error.message === "INSUFFICIENT_BALANCE") {
              return {
                status: 400,
                body: { error: { code: "INSUFFICIENT_BALANCE", message: "Insufficient balance" } },
              };
            }
            if (error.message === "BALANCE_NOT_FOUND") {
              return {
                status: 404,
                body: { error: { code: "BALANCE_NOT_FOUND", message: "Balance not found" } },
              };
            }
          }
          request.log.error(error);
          return {
            status: 500,
            body: { error: { code: "INTERNAL_ERROR", message: "Could not place order" } },
          };
        }
      }
    );
  });

  fastify.get("/orders", async (request) => {
    const userId = (request.user as any)?.sub as string;
    const parsed = listQuery.parse(request.query);
    const limit = parsed.limit ?? 50;

    const orders = await prisma.order.findMany({
      where: {
        userId,
        status: parsed.status as any | undefined,
        marketId: parsed.marketId || undefined,
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return {
      items: orders.map(serializeOrder),
      nextCursor: null,
    };
  });

  fastify.post("/orders/:orderId/cancel", async (request, reply) => {
    const userId = (request.user as any)?.sub as string;
    const { orderId } = request.params as { orderId: string };

    const order = await prisma.order.findFirst({ where: { id: orderId, userId } });
    if (!order) {
      return sendError(reply, 404, "NOT_FOUND", "Order not found");
    }

    const updated = await prisma.order.update({
      where: { id: order.id },
      data: { status: "canceled" },
    });

    return serializeOrder(updated);
  });
};

