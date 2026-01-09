import { FastifyReply } from "fastify";

export function sendError(
  reply: FastifyReply,
  status: number,
  code: string,
  message: string,
  details?: Record<string, unknown>
) {
  const payload: {
    error: { code: string; message: string; details?: Record<string, unknown> };
  } = { error: { code, message } };
  if (details) {
    payload.error.details = details;
  }
  return reply.status(status).send(payload);
}


