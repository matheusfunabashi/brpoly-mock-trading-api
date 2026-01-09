import { FastifyPluginAsync } from "fastify";
import { prisma } from "../lib/prisma.js";
import { serializePosition } from "../lib/serializers.js";

export const positionsRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.addHook("preHandler", fastify.authenticate);

  fastify.get("/positions", async (request) => {
    const userId = (request.user as any)?.sub as string;
    const positions = await prisma.position.findMany({
      where: { userId },
    });

    return {
      items: positions.map(serializePosition),
    };
  });
};


