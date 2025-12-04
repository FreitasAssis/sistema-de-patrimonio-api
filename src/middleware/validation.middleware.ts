import { FastifyRequest, FastifyReply } from 'fastify';
import { ZodSchema, ZodError } from 'zod';
import { sendError } from '../utils/response';

export const validate = (schema: ZodSchema) => {
  return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    try {
      schema.parse(request.body);
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        return sendError(
          reply,
          'Erro de validação',
          400,
          'VALIDATION_ERROR',
          errors
        );
      }

      return sendError(
        reply,
        'Erro ao validar dados',
        500,
        'VALIDATION_ERROR'
      );
    }
  };
};
