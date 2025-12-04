import { FastifyInstance } from 'fastify';
import * as userController from '../controllers/user.controller';
import { validate } from '../middleware/validation.middleware';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';
import { createUserSchema, updateUserSchema } from '../schemas/user.schema';

export default async function userRoutes(fastify: FastifyInstance) {
  // All user routes require authentication
  fastify.addHook('preHandler', authenticate);

  // GET all users (admin only)
  fastify.get('/', {
    preHandler: requireAdmin,
    handler: userController.getAllUsers,
  });

  // GET user by ID (any authenticated user can view)
  fastify.get('/:id', userController.getUserById);

  // CREATE user (admin only)
  fastify.post('/', {
    preHandler: [requireAdmin, validate(createUserSchema)],
    handler: userController.createUser,
  });

  // UPDATE user (admin only)
  fastify.put('/:id', {
    preHandler: [requireAdmin, validate(updateUserSchema)],
    handler: userController.updateUser,
  });

  // DELETE user (admin only)
  fastify.delete('/:id', {
    preHandler: requireAdmin,
    handler: userController.deleteUser,
  });
}
