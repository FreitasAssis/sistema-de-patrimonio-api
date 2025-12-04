import { FastifyInstance } from 'fastify';
import * as bemController from '../controllers/bem.controller';
import { validate } from '../middleware/validation.middleware';
import { authenticate } from '../middleware/auth.middleware';
import { createBemSchema, updateBemSchema } from '../schemas/bem.schema';

export default async function bemRoutes(fastify: FastifyInstance) {
  // All bem routes require authentication
  fastify.addHook('preHandler', authenticate);

  // GET all bens
  fastify.get('/', bemController.getAllBens);

  // GET bem by ID
  fastify.get('/:id', bemController.getBemById);

  // GET bem by tombo
  fastify.get('/tombo/:tombo', bemController.getBemByTombo);

  // CREATE bem
  fastify.post('/', {
    preHandler: validate(createBemSchema),
    handler: bemController.createBem,
  });

  // UPDATE bem
  fastify.put('/:id', {
    preHandler: validate(updateBemSchema),
    handler: bemController.updateBem,
  });

  // DELETE bem
  fastify.delete('/:id', bemController.deleteBem);
}
