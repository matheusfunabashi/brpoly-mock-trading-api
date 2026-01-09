import { FastifyPluginAsync } from "fastify";
import { prisma } from "../lib/prisma.js";
import { sendError } from "../lib/errors.js";

async function ensureAdmin(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  return user?.role === "admin";
}

export const adminRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.addHook("preHandler", fastify.authenticate);

  const notImplemented = (reply: any) =>
    sendError(reply, 501, "NOT_IMPLEMENTED", "Endpoint not implemented yet");

  fastify.post("/admin/markets", async (request, reply) => {
    const userId = (request.user as any)?.sub as string;
    if (!(await ensureAdmin(userId))) {
      return sendError(reply, 403, "FORBIDDEN", "Admin only");
    }
    return notImplemented(reply);
  });

  fastify.patch("/admin/markets/:id", async (request, reply) => {
    const userId = (request.user as any)?.sub as string;
    if (!(await ensureAdmin(userId))) {
      return sendError(reply, 403, "FORBIDDEN", "Admin only");
    }
    return notImplemented(reply);
  });

  fastify.post("/admin/markets/:id/resolve", async (request, reply) => {
    const userId = (request.user as any)?.sub as string;
    if (!(await ensureAdmin(userId))) {
      return sendError(reply, 403, "FORBIDDEN", "Admin only");
    }
    return notImplemented(reply);
  });

  fastify.post("/admin/markets/:id/cancel", async (request, reply) => {
    const userId = (request.user as any)?.sub as string;
    if (!(await ensureAdmin(userId))) {
      return sendError(reply, 403, "FORBIDDEN", "Admin only");
    }
    return notImplemented(reply);
  });

  fastify.get("/admin/kyc/cases", async (request, reply) => {
    const userId = (request.user as any)?.sub as string;
    if (!(await ensureAdmin(userId))) {
      return sendError(reply, 403, "FORBIDDEN", "Admin only");
    }
    return notImplemented(reply);
  });

  fastify.patch("/admin/kyc/cases/:kycCaseId", async (request, reply) => {
    const userId = (request.user as any)?.sub as string;
    if (!(await ensureAdmin(userId))) {
      return sendError(reply, 403, "FORBIDDEN", "Admin only");
    }
    return notImplemented(reply);
  });

  fastify.get("/admin/users", async (request, reply) => {
    const userId = (request.user as any)?.sub as string;
    if (!(await ensureAdmin(userId))) {
      return sendError(reply, 403, "FORBIDDEN", "Admin only");
    }
    return notImplemented(reply);
  });

  fastify.patch("/admin/users/:userId", async (request, reply) => {
    const userId = (request.user as any)?.sub as string;
    if (!(await ensureAdmin(userId))) {
      return sendError(reply, 403, "FORBIDDEN", "Admin only");
    }
    return notImplemented(reply);
  });

  fastify.get("/admin/audit", async (request, reply) => {
    const userId = (request.user as any)?.sub as string;
    if (!(await ensureAdmin(userId))) {
      return sendError(reply, 403, "FORBIDDEN", "Admin only");
    }
    return notImplemented(reply);
  });
};


