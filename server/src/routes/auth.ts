import { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma.js";
import { sendError } from "../lib/errors.js";
import { createToken } from "../lib/auth.js";
import { serializeUser } from "../lib/serializers.js";

const registerBody = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  fullName: z.string().min(1),
});

const loginBody = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const authRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post("/auth/register", { preHandler: [] }, async (request, reply) => {
    const parsed = registerBody.safeParse(request.body);
    if (!parsed.success) {
      return sendError(reply, 400, "INVALID_INPUT", "Invalid request body", parsed.error.format());
    }

    const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
    if (existing) {
      return sendError(reply, 400, "EMAIL_TAKEN", "Email already registered");
    }

    const passwordHash = await bcrypt.hash(parsed.data.password, 10);
    const user = await prisma.user.create({
      data: {
        email: parsed.data.email,
        password: passwordHash,
        fullName: parsed.data.fullName,
      },
    });

    await prisma.walletBalance.create({
      data: {
        userId: user.id,
        brlAvailable: 0,
        brlReserved: 0,
        totalBrl: 0,
      },
    });

    const token = await createToken(user.id, fastify);
    reply.status(201);
    return { user: serializeUser(user), token };
  });

  fastify.post("/auth/login", async (request, reply) => {
    const parsed = loginBody.safeParse(request.body);
    if (!parsed.success) {
      return sendError(reply, 400, "INVALID_INPUT", "Invalid request body", parsed.error.format());
    }

    const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
    if (!user) {
      return sendError(reply, 401, "INVALID_CREDENTIALS", "Invalid credentials");
    }

    const ok = await bcrypt.compare(parsed.data.password, user.password);
    if (!ok) {
      return sendError(reply, 401, "INVALID_CREDENTIALS", "Invalid credentials");
    }

    const token = await createToken(user.id, fastify);
    return { user: serializeUser(user), token };
  });

  fastify.get("/auth/me", { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const userId = (request.user as any)?.sub as string;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return sendError(reply, 401, "UNAUTHORIZED", "Unauthorized");
    }
    return serializeUser(user);
  });

  fastify.post("/auth/logout", async (_request, reply) => {
    reply.status(204);
    return null;
  });
};

