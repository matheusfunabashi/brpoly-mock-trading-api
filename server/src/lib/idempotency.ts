import { FastifyReply, FastifyRequest } from "fastify";
import { Prisma } from "@prisma/client";
import { prisma } from "./prisma.js";
import { sendError } from "./errors.js";

type HandlerResult<T> = { status: number; body: T };

export async function handleIdempotent<T>(
  request: FastifyRequest,
  reply: FastifyReply,
  opts: { userId: string; endpoint: string },
  handler: () => Promise<HandlerResult<T>>
) {
  const header = request.headers["idempotency-key"];
  if (!header || typeof header !== "string") {
    return sendError(reply, 400, "IDEMPOTENCY_KEY_REQUIRED", "Idempotency-Key header is required");
  }

  const existing = await prisma.idempotencyKey.findUnique({
    where: {
      key_userId_endpoint: {
        key: header,
        userId: opts.userId,
        endpoint: opts.endpoint,
      },
    },
  });

  if (existing) {
    reply.status(existing.statusCode);
    return existing.response as T;
  }

  const result = await handler();

  await prisma.idempotencyKey.create({
    data: {
      key: header,
      userId: opts.userId,
      endpoint: opts.endpoint,
      statusCode: result.status,
      response: result.body as unknown as Prisma.InputJsonValue,
    },
  });

  reply.status(result.status);
  return result.body;
}


