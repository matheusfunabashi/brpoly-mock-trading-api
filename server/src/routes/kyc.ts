import { FastifyPluginAsync } from "fastify";

export const kycRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.addHook("preHandler", fastify.authenticate);

  fastify.post("/kyc/start", async (_request, reply) => {
    reply.status(201);
    return {
      kycCaseId: `kyc_${Date.now()}`,
      provider: "mock-provider",
      status: "pending",
      redirectUrl: "https://kyc.example.com/verify",
      updatedAt: new Date().toISOString(),
    };
  });

  fastify.get("/kyc/status", async (_request) => {
    return {
      status: "pending",
      updatedAt: new Date().toISOString(),
      reason: "Verificação em andamento",
    };
  });
};


