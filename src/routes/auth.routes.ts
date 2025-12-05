import { FastifyInstance } from 'fastify';
import * as authController from '../controllers/auth.controller';
import { validate } from '../middleware/validation.middleware';
import { authenticate } from '../middleware/auth.middleware';
import { loginSchema, changePasswordSchema, recoverPasswordSchema } from '../schemas/auth.schema';

export default async function authRoutes(fastify: FastifyInstance) {
  // Public routes
  fastify.post('/login', {
    preHandler: validate(loginSchema),
    handler: authController.login,
  });

  fastify.post('/recover-password', {
    preHandler: validate(recoverPasswordSchema),
    handler: authController.recoverPassword,
  });

  // Protected routes (require authentication)
  fastify.post('/logout', {
    preHandler: authenticate,
    handler: authController.logout,
  });

  fastify.patch('/change-password', {
    preHandler: [authenticate, validate(changePasswordSchema)],
    handler: authController.changePassword,
  });

  fastify.get('/me', {
    preHandler: authenticate,
    handler: authController.me,
  });
}
