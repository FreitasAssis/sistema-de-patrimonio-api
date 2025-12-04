import { FastifyInstance } from 'fastify';
import { Perfil, Categoria, Localizacao, TipoMovimentacao } from '../models';
import { createReferenceController } from '../controllers/reference.controller';
import { validate } from '../middleware/validation.middleware';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';
import {
  createReferenceSchema,
  updateReferenceSchema,
  createLocalizacaoSchema,
  updateLocalizacaoSchema,
  createPerfilSchema,
  updatePerfilSchema,
  createTipoMovimentacaoSchema,
  updateTipoMovimentacaoSchema,
} from '../schemas/reference.schema';

// Create controllers for each reference table
const perfilController = createReferenceController(Perfil, 'Perfil');
const categoriaController = createReferenceController(Categoria, 'Categoria');
const localizacaoController = createReferenceController(Localizacao, 'Localização');
const tipoMovimentacaoController = createReferenceController(TipoMovimentacao, 'Tipo de Movimentação');

// Perfis Routes (Admin only for modifications)
export async function perfilRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', authenticate);

  // Any authenticated user can view
  fastify.get('/', perfilController.getAll);
  fastify.get('/:id', perfilController.getById);

  // Admin only for modifications
  fastify.post('/', {
    preHandler: [requireAdmin, validate(createPerfilSchema)],
    handler: perfilController.create,
  });
  fastify.put('/:id', {
    preHandler: [requireAdmin, validate(updatePerfilSchema)],
    handler: perfilController.update,
  });
  fastify.delete('/:id', {
    preHandler: requireAdmin,
    handler: perfilController.delete,
  });
}

// Categorias Routes (Admin only for modifications)
export async function categoriaRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', authenticate);

  // Any authenticated user can view
  fastify.get('/', categoriaController.getAll);
  fastify.get('/:id', categoriaController.getById);

  // Admin only for modifications
  fastify.post('/', {
    preHandler: [requireAdmin, validate(createReferenceSchema)],
    handler: categoriaController.create,
  });
  fastify.put('/:id', {
    preHandler: [requireAdmin, validate(updateReferenceSchema)],
    handler: categoriaController.update,
  });
  fastify.delete('/:id', {
    preHandler: requireAdmin,
    handler: categoriaController.delete,
  });
}

// Localizacoes Routes (Admin only for modifications)
export async function localizacaoRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', authenticate);

  // Any authenticated user can view
  fastify.get('/', localizacaoController.getAll);
  fastify.get('/:id', localizacaoController.getById);

  // Admin only for modifications
  fastify.post('/', {
    preHandler: [requireAdmin, validate(createLocalizacaoSchema)],
    handler: localizacaoController.create,
  });
  fastify.put('/:id', {
    preHandler: [requireAdmin, validate(updateLocalizacaoSchema)],
    handler: localizacaoController.update,
  });
  fastify.delete('/:id', {
    preHandler: requireAdmin,
    handler: localizacaoController.delete,
  });
}

// Tipos Movimentacao Routes (Admin only for modifications)
export async function tipoMovimentacaoRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', authenticate);

  // Any authenticated user can view
  fastify.get('/', tipoMovimentacaoController.getAll);
  fastify.get('/:id', tipoMovimentacaoController.getById);

  // Admin only for modifications
  fastify.post('/', {
    preHandler: [requireAdmin, validate(createTipoMovimentacaoSchema)],
    handler: tipoMovimentacaoController.create,
  });
  fastify.put('/:id', {
    preHandler: [requireAdmin, validate(updateTipoMovimentacaoSchema)],
    handler: tipoMovimentacaoController.update,
  });
  fastify.delete('/:id', {
    preHandler: requireAdmin,
    handler: tipoMovimentacaoController.delete,
  });
}
