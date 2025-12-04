import { FastifyRequest, FastifyReply } from 'fastify';
import { Bem, Categoria, Localizacao, Movimentacao } from '../models';
import { CreateBemInput, UpdateBemInput } from '../schemas/bem.schema';
import { sendSuccess, sendError, sendCreated } from '../utils/response';
import { Op } from 'sequelize';

export const getAllBens = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const bens = await Bem.findAll({
      where: { ativo: true },
      include: [
        { model: Categoria, as: 'categoria' },
        { model: Localizacao, as: 'localizacao' },
      ],
      order: [['createdAt', 'DESC']],
    });

    return sendSuccess(reply, bens);
  } catch (error: any) {
    return sendError(reply, error.message || 'Erro ao buscar bens', 500, 'GET_BENS_ERROR');
  }
};

export const getBemById = async (
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) => {
  try {
    const { id } = request.params;

    const bem = await Bem.findByPk(id, {
      include: [
        { model: Categoria, as: 'categoria' },
        { model: Localizacao, as: 'localizacao' },
      ],
    });

    if (!bem) {
      return sendError(reply, 'Bem não encontrado', 404, 'BEM_NOT_FOUND');
    }

    return sendSuccess(reply, bem);
  } catch (error: any) {
    return sendError(reply, error.message || 'Erro ao buscar bem', 500, 'GET_BEM_ERROR');
  }
};

export const getBemByTombo = async (
  request: FastifyRequest<{ Params: { tombo: string } }>,
  reply: FastifyReply
) => {
  try {
    const { tombo } = request.params;

    const bem = await Bem.findOne({
      where: { tombo, ativo: true },
      include: [
        { model: Categoria, as: 'categoria' },
        { model: Localizacao, as: 'localizacao' },
      ],
    });

    if (!bem) {
      return sendError(reply, 'Bem não encontrado', 404, 'BEM_NOT_FOUND');
    }

    return sendSuccess(reply, bem);
  } catch (error: any) {
    return sendError(reply, error.message || 'Erro ao buscar bem', 500, 'GET_BEM_ERROR');
  }
};

export const createBem = async (
  request: FastifyRequest<{ Body: CreateBemInput }>,
  reply: FastifyReply
) => {
  try {
    const { tombo, nome, categoriaId, localizacaoId, sala, imagemTombo, fotoBem } = request.body;

    // Check if tombo already exists
    const existingBem = await Bem.findOne({ where: { tombo } });
    if (existingBem) {
      return sendError(reply, 'Já existe um bem com este número de tombo', 409, 'TOMBO_EXISTS');
    }

    // Verify categoria exists
    const categoria = await Categoria.findByPk(categoriaId);
    if (!categoria) {
      return sendError(reply, 'Categoria não encontrada', 404, 'CATEGORIA_NOT_FOUND');
    }

    // Verify localizacao exists
    const localizacao = await Localizacao.findByPk(localizacaoId);
    if (!localizacao) {
      return sendError(reply, 'Localização não encontrada', 404, 'LOCALIZACAO_NOT_FOUND');
    }

    // Create bem
    const bem = await Bem.create({
      tombo,
      nome,
      categoriaId,
      localizacaoId,
      sala,
      imagemTombo,
      fotoBem,
      ativo: true,
    });

    // Fetch bem with relations
    const createdBem = await Bem.findByPk(bem.id, {
      include: [
        { model: Categoria, as: 'categoria' },
        { model: Localizacao, as: 'localizacao' },
      ],
    });

    return sendCreated(reply, createdBem, 'Bem criado com sucesso');
  } catch (error: any) {
    return sendError(reply, error.message || 'Erro ao criar bem', 500, 'CREATE_BEM_ERROR');
  }
};

export const updateBem = async (
  request: FastifyRequest<{ Params: { id: string }; Body: UpdateBemInput }>,
  reply: FastifyReply
) => {
  try {
    const { id } = request.params;
    const updates = request.body;

    const bem = await Bem.findByPk(id);

    if (!bem) {
      return sendError(reply, 'Bem não encontrado', 404, 'BEM_NOT_FOUND');
    }

    // If updating tombo, check uniqueness
    if (updates.tombo && updates.tombo !== bem.tombo) {
      const existingBem = await Bem.findOne({ where: { tombo: updates.tombo } });
      if (existingBem) {
        return sendError(reply, 'Tombo já está em uso', 409, 'TOMBO_IN_USE');
      }
    }

    // If updating categoriaId, verify it exists
    if (updates.categoriaId) {
      const categoria = await Categoria.findByPk(updates.categoriaId);
      if (!categoria) {
        return sendError(reply, 'Categoria não encontrada', 404, 'CATEGORIA_NOT_FOUND');
      }
    }

    // If updating localizacaoId, verify it exists
    if (updates.localizacaoId) {
      const localizacao = await Localizacao.findByPk(updates.localizacaoId);
      if (!localizacao) {
        return sendError(reply, 'Localização não encontrada', 404, 'LOCALIZACAO_NOT_FOUND');
      }
    }

    // Update bem
    await bem.update(updates);

    // Fetch updated bem with relations
    const updatedBem = await Bem.findByPk(id, {
      include: [
        { model: Categoria, as: 'categoria' },
        { model: Localizacao, as: 'localizacao' },
      ],
    });

    return sendSuccess(reply, updatedBem, 'Bem atualizado com sucesso');
  } catch (error: any) {
    return sendError(reply, error.message || 'Erro ao atualizar bem', 500, 'UPDATE_BEM_ERROR');
  }
};

export const deleteBem = async (
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) => {
  try {
    const { id } = request.params;

    const bem = await Bem.findByPk(id);

    if (!bem) {
      return sendError(reply, 'Bem não encontrado', 404, 'BEM_NOT_FOUND');
    }

    // Check if bem has active loans
    const activeMovimentacoes = await Movimentacao.count({
      where: {
        bemId: id,
        dataDevolucao: null,
      },
    });

    if (activeMovimentacoes > 0) {
      return sendError(
        reply,
        'Não é possível excluir um bem com empréstimos ativos',
        400,
        'HAS_ACTIVE_LOANS'
      );
    }

    // Soft delete
    await bem.update({ ativo: false });

    return sendSuccess(reply, null, 'Bem excluído com sucesso');
  } catch (error: any) {
    return sendError(reply, error.message || 'Erro ao excluir bem', 500, 'DELETE_BEM_ERROR');
  }
};
