import { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { randomUUID } from "crypto";
import { prisma } from "../lib/prisma.js";
import { sendError } from "../lib/errors.js";
import { handleIdempotent } from "../lib/idempotency.js";
import { serializeBalance, serializePixDeposit } from "../lib/serializers.js";

const decimalString = z
  .string()
  .regex(/^-?\d+(\.\d+)?$/, "Must be a decimal string");

const pixDepositSchema = z.object({
  amountBrl: decimalString,
});

const pixWithdrawalSchema = z.object({
  amountBrl: decimalString,
  pixKeyType: z.enum(["cpf", "cnpj", "email", "phone", "evp"]),
  pixKeyValue: z.string(),
});

export const walletRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.addHook("preHandler", fastify.authenticate);

  fastify.get("/wallet/balance", async (request, reply) => {
    const userId = (request.user as any)?.sub as string;
    const balance = await prisma.walletBalance.findUnique({ where: { userId } });
    if (!balance) {
      return sendError(reply, 404, "NOT_FOUND", "Balance not found");
    }
    return serializeBalance(balance);
  });

  fastify.post("/wallet/deposits/pix/create", async (request, reply) => {
    const userId = (request.user as any)?.sub as string;
    const parsed = pixDepositSchema.safeParse(request.body);
    if (!parsed.success) {
      return sendError(reply, 400, "INVALID_INPUT", "Invalid request body", parsed.error.format());
    }

    const amount = new Prisma.Decimal(parsed.data.amountBrl);
    if (amount.lte(0)) {
      return sendError(reply, 400, "INVALID_INPUT", "Amount must be greater than zero");
    }

    return handleIdempotent(
      request,
      reply,
      { userId, endpoint: "wallet.pixDeposit" },
      async () => {
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
        const qrCodeText = `00020126580014br.gov.bcb.pix0136${randomUUID()}`;

        const deposit = await prisma.pixDeposit.create({
          data: {
            userId,
            amountBrl: amount,
            status: "pending",
            qrCodeText,
            qrCodeImageUrl: "https://via.placeholder.com/200",
            expiresAt,
          },
        });

        return { status: 201, body: serializePixDeposit(deposit) };
      }
    );
  });

  fastify.get("/wallet/deposits/pix/:depositId", async (request, reply) => {
    const { depositId } = request.params as { depositId: string };
    const userId = (request.user as any)?.sub as string;

    const deposit = await prisma.pixDeposit.findUnique({ where: { id: depositId } });
    if (!deposit || deposit.userId !== userId) {
      return sendError(reply, 404, "NOT_FOUND", "Deposit not found");
    }

    return serializePixDeposit(deposit);
  });

  fastify.post("/wallet/withdrawals/pix/create", async (request, reply) => {
    const userId = (request.user as any)?.sub as string;
    const parsed = pixWithdrawalSchema.safeParse(request.body);
    if (!parsed.success) {
      return sendError(reply, 400, "INVALID_INPUT", "Invalid request body", parsed.error.format());
    }

    return handleIdempotent(
      request,
      reply,
      { userId, endpoint: "wallet.pixWithdrawal" },
      async () => {
        const payload = {
          withdrawalId: `with_${Date.now()}`,
          status: "processing",
          createdAt: new Date().toISOString(),
          amountBrl: parsed.data.amountBrl,
          pixKeyType: parsed.data.pixKeyType,
          pixKeyValue: parsed.data.pixKeyValue,
        };
        return { status: 201, body: payload };
      }
    );
  });

  fastify.post("/wallet/deposits/crypto/createAddress", async (request, reply) => {
    const body = request.body as { asset: string; chain: string };
    reply.status(201);
    return {
      depositId: `crypto_dep_${Date.now()}`,
      address: "0xabc123",
      asset: body?.asset ?? "USDC",
      chain: body?.chain ?? "polygon",
      status: "pending",
      confirmations: 0,
    };
  });

  fastify.get("/wallet/deposits/crypto/:depositId", async (request) => {
    const { depositId } = request.params as { depositId: string };
    return {
      depositId,
      address: "0xabc123",
      asset: "USDC",
      chain: "polygon",
      status: "confirmed",
      confirmations: 20,
    };
  });

  fastify.post("/wallet/withdrawals/crypto/create", async (request, reply) => {
    const body = request.body as { amount: string; asset: string; chain: string; address: string };
    reply.status(201);
    return {
      withdrawalId: `crypto_with_${Date.now()}`,
      status: "processing",
      amount: body?.amount ?? "0",
      asset: body?.asset ?? "USDC",
      chain: body?.chain ?? "polygon",
      address: body?.address ?? "0xabc123",
    };
  });

  fastify.post("/dev/pix/deposits/:depositId/complete", async (request, reply) => {
    if (process.env.NODE_ENV === "production") {
      return sendError(reply, 404, "NOT_FOUND", "Route not available in production");
    }

    const userId = (request.user as any)?.sub as string;
    const { depositId } = request.params as { depositId: string };

    try {
      const result = await prisma.$transaction(async (tx) => {
        const deposit = await tx.pixDeposit.findUnique({ where: { id: depositId } });
        if (!deposit || deposit.userId !== userId) {
          throw new Error("NOT_FOUND");
        }

        if (deposit.status !== "pending" && deposit.status !== "completed") {
          throw new Error("INVALID_STATUS");
        }

        if (deposit.status === "completed") {
          const balance = await tx.walletBalance.findUnique({ where: { userId } });
          if (!balance) {
            throw new Error("BALANCE_NOT_FOUND");
          }
          return { deposit, balance };
        }

        const updatedDeposit = await tx.pixDeposit.update({
          where: { id: depositId },
          data: { status: "completed", completedAt: new Date() },
        });

        const existingTx = await tx.walletTransaction.findUnique({
          where: { referenceType_referenceId: { referenceType: "PIX_DEPOSIT", referenceId: depositId } },
        });

        const depositAmount = deposit.amountBrl;

        let balance = await tx.walletBalance.findUnique({ where: { userId } });

        if (!existingTx) {
          await tx.walletTransaction.create({
            data: {
              userId,
              type: "PIX_DEPOSIT_CREDIT",
              amountBrl: depositAmount,
              referenceType: "PIX_DEPOSIT",
              referenceId: depositId,
            },
          });

          balance = await tx.walletBalance.upsert({
            where: { userId },
            update: {
              brlAvailable: { increment: depositAmount },
              totalBrl: { increment: depositAmount },
              updatedAt: new Date(),
            },
            create: {
              userId,
              brlAvailable: depositAmount,
              brlReserved: new Prisma.Decimal(0),
              totalBrl: depositAmount,
              updatedAt: new Date(),
            },
          });
        } else {
          if (!balance) {
            balance = await tx.walletBalance.create({
              data: {
                userId,
                brlAvailable: depositAmount,
                brlReserved: new Prisma.Decimal(0),
                totalBrl: depositAmount,
                updatedAt: new Date(),
              },
            });
          }
        }

        return { deposit: updatedDeposit, balance };
      });

      return {
        deposit: serializePixDeposit(result.deposit),
        balance: serializeBalance(result.balance),
      };
    } catch (error: any) {
      if (error instanceof Error && error.message === "NOT_FOUND") {
        return sendError(reply, 404, "NOT_FOUND", "Deposit not found");
      }
      if (error instanceof Error && error.message === "INVALID_STATUS") {
        return sendError(reply, 400, "INVALID_STATUS", "Deposit cannot be completed");
      }
      if (error instanceof Error && error.message === "BALANCE_NOT_FOUND") {
        return sendError(reply, 500, "BALANCE_NOT_FOUND", "Wallet balance missing for user");
      }
      request.log.error(error);
      return sendError(reply, 500, "INTERNAL_ERROR", "Could not complete deposit");
    }
  });
};

