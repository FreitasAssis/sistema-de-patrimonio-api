import { FastifyReply } from 'fastify';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code?: string;
    message: string;
    details?: any;
  };
}

export const sendSuccess = <T>(
  reply: FastifyReply,
  data: T,
  message?: string,
  statusCode: number = 200
): FastifyReply => {
  return reply.status(statusCode).send({
    success: true,
    data,
    message,
  } as ApiResponse<T>);
};

export const sendError = (
  reply: FastifyReply,
  message: string,
  statusCode: number = 500,
  code?: string,
  details?: any
): FastifyReply => {
  return reply.status(statusCode).send({
    success: false,
    error: {
      code,
      message,
      details,
    },
  } as ApiResponse);
};

export const sendCreated = <T>(
  reply: FastifyReply,
  data: T,
  message?: string
): FastifyReply => {
  return sendSuccess(reply, data, message, 201);
};

export const sendNoContent = (reply: FastifyReply): FastifyReply => {
  return reply.status(204).send();
};
