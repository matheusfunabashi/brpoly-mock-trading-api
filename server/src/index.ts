import Fastify from "fastify";
import cors from "@fastify/cors";
import dotenv from "dotenv";
import { authPlugin } from "./lib/auth.js";
import { authRoutes } from "./routes/auth.js";
import { marketsRoutes } from "./routes/markets.js";
import { ordersRoutes } from "./routes/orders.js";
import { positionsRoutes } from "./routes/positions.js";
import { walletRoutes } from "./routes/wallet.js";
import { kycRoutes } from "./routes/kyc.js";
import { adminRoutes } from "./routes/admin.js";
import { healthRoute } from "./routes/system.js";
import { sendError } from "./lib/errors.js";

dotenv.config({ path: ".env" });

const PORT = Number(process.env.PORT ?? 3001);
const HOST = process.env.HOST ?? "0.0.0.0";

async function buildServer() {
  const fastify = Fastify({ logger: true });
  await fastify.register(cors, { origin: "*" });
  await fastify.register(authPlugin);

  await fastify.register(healthRoute);
  await fastify.register(authRoutes);
  await fastify.register(marketsRoutes);
  await fastify.register(ordersRoutes);
  await fastify.register(positionsRoutes);
  await fastify.register(walletRoutes);
  await fastify.register(kycRoutes);
  await fastify.register(adminRoutes);

  fastify.setErrorHandler((error, request, reply) => {
    request.log.error(error);
    const status = reply.statusCode && reply.statusCode >= 400 ? reply.statusCode : 500;
    return sendError(reply, status, "INTERNAL_ERROR", "Unexpected server error");
  });

  return fastify;
}

buildServer()
  .then((app) =>
    app.listen({ port: PORT, host: HOST }).then(() => {
      app.log.info(`API listening on ${HOST}:${PORT}`);
    })
  )
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error(err);
    process.exit(1);
  });

