import { FastifyInstance } from 'fastify';
import * as movimentacaoController from '../controllers/movimentacao.controller';
import { validate } from '../middleware/validation.middleware';
import { authenticate } from '../middleware/auth.middleware';
import { createMovimentacaoSchema, updateMovimentacaoSchema } from '../schemas/movimentacao.schema';

export default async function movimentacaoRoutes(fastify: FastifyInstance) {
  // All movimentacao routes require authentication
  fastify.addHook('preHandler', authenticate);

  // GET all movimentacoes
  fastify.get('/', movimentacaoController.getAllMovimentacoes);

  // GET active loans
  fastify.get('/active', movimentacaoController.getActiveLoans);

  // GET movimentacao by ID
  fastify.get('/:id', movimentacaoController.getMovimentacaoById);

  // CREATE movimentacao
  fastify.post('/', {
    preHandler: validate(createMovimentacaoSchema),
    handler: movimentacaoController.createMovimentacao,
  });

  // UPDATE movimentacao
  fastify.put('/:id', {
    preHandler: validate(updateMovimentacaoSchema),
    handler: movimentacaoController.updateMovimentacao,
  });

  // Register return (convenience endpoint)
  fastify.post('/:id/return', movimentacaoController.registerReturn);
}
