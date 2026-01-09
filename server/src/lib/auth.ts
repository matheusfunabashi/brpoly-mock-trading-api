import fp from "fastify-plugin";
import fastifyJwt from "@fastify/jwt";
import { FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "./prisma.js";
import { sendError } from "./errors.js";
import { z } from "zod";

const envSchema = z.object({
  JWT_SECRET: z.string().min(1, "JWT_SECRET is required"),
});

export const authPlugin = fp(async (fastify) => {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    throw new Error(parsed.error.message);
  }

  fastify.register(fastifyJwt, {
    secret: parsed.data.JWT_SECRET,
  });

  fastify.decorate("authenticate", async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await request.jwtVerify();
    } catch {
      return sendError(reply, 401, "UNAUTHORIZED", "Unauthorized");
    }
  });
});

export type JwtPayload = {
  sub: string;
};

export async function createToken(userId: string, fastify: any) {
  return fastify.jwt.sign({ sub: userId });
}

export async function currentUser(request: FastifyRequest) {
  const payload = request.user as JwtPayload | undefined;
  if (!payload?.sub) return null;
  return prisma.user.findUnique({ where: { id: payload.sub } });
}

declare module "fastify" {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: JwtPayload;
    user: JwtPayload;
  }
}


