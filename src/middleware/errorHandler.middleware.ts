import { FastifyError, FastifyRequest, FastifyReply } from 'fastify';
import { AppError } from '../utils/errors';

export const errorHandler = (
  error: FastifyError | AppError,
  request: FastifyRequest,
  reply: FastifyReply
) => {
  // Log error for debugging
  console.error('Error:', {
    name: error.name,
    message: error.message,
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
  });

  // Handle custom AppError
  if (error instanceof AppError) {
    return reply.status(error.statusCode).send({
      success: false,
      error: {
        code: error.code,
        message: error.message,
      },
    });
  }

  // Handle Fastify validation errors
  if (error.validation) {
    return reply.status(400).send({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Erro de validação',
        details: error.validation,
      },
    });
  }

  // Handle database errors
  if (error.name === 'SequelizeUniqueConstraintError') {
    return reply.status(409).send({
      success: false,
      error: {
        code: 'CONFLICT',
        message: 'Registro já existe',
      },
    });
  }

  if (error.name === 'SequelizeForeignKeyConstraintError') {
    return reply.status(400).send({
      success: false,
      error: {
        code: 'FOREIGN_KEY_ERROR',
        message: 'Referência inválida',
      },
    });
  }

  // Default error
  return reply.status(error.statusCode || 500).send({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: process.env.NODE_ENV === 'production'
        ? 'Erro interno do servidor'
        : error.message,
    },
  });
};
