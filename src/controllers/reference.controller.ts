import { FastifyRequest, FastifyReply } from 'fastify';
import { Model, ModelCtor } from 'sequelize-typescript';
import { sendSuccess, sendError, sendCreated } from '../utils/response';

/**
 * Generic CRUD controller factory for reference tables
 * (Perfil, Categoria, Localizacao, TipoMovimentacao)
 */
export const createReferenceController = <T extends Model>(model: ModelCtor<T>, modelName: string) => {
  return {
    getAll: async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const items = await model.findAll({
          where: { ativo: true } as any,
          order: [['nome', 'ASC']],
        });

        return sendSuccess(reply, items);
      } catch (error: any) {
        return sendError(reply, error.message || `Erro ao buscar ${modelName}`, 500, 'GET_ERROR');
      }
    },

    getById: async (
      request: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply
    ) => {
      try {
        const { id } = request.params;

        const item = await model.findByPk(id);

        if (!item) {
          return sendError(reply, `${modelName} não encontrado(a)`, 404, 'NOT_FOUND');
        }

        return sendSuccess(reply, item);
      } catch (error: any) {
        return sendError(reply, error.message || `Erro ao buscar ${modelName}`, 500, 'GET_ERROR');
      }
    },

    create: async (
      request: FastifyRequest<{ Body: any }>,
      reply: FastifyReply
    ) => {
      try {
        const data = request.body as any;

        // Check if nome already exists
        const existing = await model.findOne({ where: { nome: data.nome } as any });
        if (existing) {
          return sendError(reply, `${modelName} com este nome já existe`, 409, 'ALREADY_EXISTS');
        }

        const item = await model.create({ ...data, ativo: true } as any);

        return sendCreated(reply, item, `${modelName} criado(a) com sucesso`);
      } catch (error: any) {
        return sendError(reply, error.message || `Erro ao criar ${modelName}`, 500, 'CREATE_ERROR');
      }
    },

    update: async (
      request: FastifyRequest<{ Params: { id: string }; Body: any }>,
      reply: FastifyReply
    ) => {
      try {
        const { id } = request.params;
        const updates = request.body as any;

        const item = await model.findByPk(id);

        if (!item) {
          return sendError(reply, `${modelName} não encontrado(a)`, 404, 'NOT_FOUND');
        }

        // If updating nome, check uniqueness
        if (updates.nome && updates.nome !== (item as any).nome) {
          const existing = await model.findOne({ where: { nome: updates.nome } as any });
          if (existing) {
            return sendError(reply, 'Nome já está em uso', 409, 'NAME_IN_USE');
          }
        }

        await item.update(updates as any);

        return sendSuccess(reply, item, `${modelName} atualizado(a) com sucesso`);
      } catch (error: any) {
        return sendError(reply, error.message || `Erro ao atualizar ${modelName}`, 500, 'UPDATE_ERROR');
      }
    },

    delete: async (
      request: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply
    ) => {
      try {
        const { id } = request.params;

        const item = await model.findByPk(id);

        if (!item) {
          return sendError(reply, `${modelName} não encontrado(a)`, 404, 'NOT_FOUND');
        }

        // Soft delete
        await item.update({ ativo: false } as any);

        return sendSuccess(reply, null, `${modelName} excluído(a) com sucesso`);
      } catch (error: any) {
        // Check for foreign key constraints
        if (error.name === 'SequelizeForeignKeyConstraintError') {
          return sendError(
            reply,
            `Não é possível excluir: existem registros vinculados a este(a) ${modelName}`,
            400,
            'HAS_DEPENDENCIES'
          );
        }

        return sendError(reply, error.message || `Erro ao excluir ${modelName}`, 500, 'DELETE_ERROR');
      }
    },
  };
};
