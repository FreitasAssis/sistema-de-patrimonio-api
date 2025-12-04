import { FastifyRequest, FastifyReply } from 'fastify';
import { Movimentacao, Bem, TipoMovimentacao, User } from '../models';
import { CreateMovimentacaoInput, UpdateMovimentacaoInput } from '../schemas/movimentacao.schema';
import { sendSuccess, sendError, sendCreated } from '../utils/response';

export const getAllMovimentacoes = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const movimentacoes = await Movimentacao.findAll({
      include: [
        { model: Bem, as: 'bem' },
        { model: TipoMovimentacao, as: 'tipo' },
        { model: User, as: 'usuario' },
      ],
      order: [['createdAt', 'DESC']],
    });

    return sendSuccess(reply, movimentacoes);
  } catch (error: any) {
    return sendError(reply, error.message || 'Erro ao buscar movimentações', 500, 'GET_MOVIMENTACOES_ERROR');
  }
};

export const getMovimentacaoById = async (
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) => {
  try {
    const { id } = request.params;

    const movimentacao = await Movimentacao.findByPk(id, {
      include: [
        { model: Bem, as: 'bem' },
        { model: TipoMovimentacao, as: 'tipo' },
        { model: User, as: 'usuario' },
      ],
    });

    if (!movimentacao) {
      return sendError(reply, 'Movimentação não encontrada', 404, 'MOVIMENTACAO_NOT_FOUND');
    }

    return sendSuccess(reply, movimentacao);
  } catch (error: any) {
    return sendError(reply, error.message || 'Erro ao buscar movimentação', 500, 'GET_MOVIMENTACAO_ERROR');
  }
};

export const getActiveLoans = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const activeLoans = await Movimentacao.findAll({
      where: { dataDevolucao: null },
      include: [
        { model: Bem, as: 'bem' },
        { model: TipoMovimentacao, as: 'tipo' },
        { model: User, as: 'usuario' },
      ],
      order: [['dataEmprestimo', 'DESC']],
    });

    return sendSuccess(reply, activeLoans);
  } catch (error: any) {
    return sendError(reply, error.message || 'Erro ao buscar empréstimos ativos', 500, 'GET_ACTIVE_LOANS_ERROR');
  }
};

export const createMovimentacao = async (
  request: FastifyRequest<{ Body: CreateMovimentacaoInput }>,
  reply: FastifyReply
) => {
  try {
    const { bemId, tombo, nomeItem, tipoId, pessoa, contato, pastoral, dataEmprestimo, dataDevolucao } = request.body;

    // Verify bem exists
    const bem = await Bem.findByPk(bemId);
    if (!bem) {
      return sendError(reply, 'Bem não encontrado', 404, 'BEM_NOT_FOUND');
    }

    // Verify tipo exists
    const tipo = await TipoMovimentacao.findByPk(tipoId);
    if (!tipo) {
      return sendError(reply, 'Tipo de movimentação não encontrado', 404, 'TIPO_NOT_FOUND');
    }

    // If it's a loan (empréstimo), check if item is already on loan
    if (tipo.requerDevolucao) {
      const existingLoan = await Movimentacao.findOne({
        where: {
          bemId,
          dataDevolucao: null,
        },
      });

      if (existingLoan) {
        return sendError(reply, 'Este bem já possui um empréstimo ativo', 400, 'ITEM_ALREADY_ON_LOAN');
      }
    }

    // Create movimentacao
    const movimentacao = await Movimentacao.create({
      bemId,
      tombo,
      nomeItem,
      tipoId,
      pessoa,
      contato,
      pastoral,
      dataEmprestimo,
      dataDevolucao: dataDevolucao || null,
      usuarioId: request.user?.id,
    });

    // Fetch movimentacao with relations
    const createdMovimentacao = await Movimentacao.findByPk(movimentacao.id, {
      include: [
        { model: Bem, as: 'bem' },
        { model: TipoMovimentacao, as: 'tipo' },
        { model: User, as: 'usuario' },
      ],
    });

    return sendCreated(reply, createdMovimentacao, 'Movimentação criada com sucesso');
  } catch (error: any) {
    return sendError(reply, error.message || 'Erro ao criar movimentação', 500, 'CREATE_MOVIMENTACAO_ERROR');
  }
};

export const updateMovimentacao = async (
  request: FastifyRequest<{ Params: { id: string }; Body: UpdateMovimentacaoInput }>,
  reply: FastifyReply
) => {
  try {
    const { id } = request.params;
    const { dataDevolucao } = request.body;

    const movimentacao = await Movimentacao.findByPk(id);

    if (!movimentacao) {
      return sendError(reply, 'Movimentação não encontrada', 404, 'MOVIMENTACAO_NOT_FOUND');
    }

    // Update movimentacao (typically registering a return)
    await movimentacao.update({ dataDevolucao });

    // Fetch updated movimentacao with relations
    const updatedMovimentacao = await Movimentacao.findByPk(id, {
      include: [
        { model: Bem, as: 'bem' },
        { model: TipoMovimentacao, as: 'tipo' },
        { model: User, as: 'usuario' },
      ],
    });

    return sendSuccess(reply, updatedMovimentacao, 'Movimentação atualizada com sucesso');
  } catch (error: any) {
    return sendError(reply, error.message || 'Erro ao atualizar movimentação', 500, 'UPDATE_MOVIMENTACAO_ERROR');
  }
};

export const registerReturn = async (
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) => {
  try {
    const { id } = request.params;

    const movimentacao = await Movimentacao.findByPk(id);

    if (!movimentacao) {
      return sendError(reply, 'Movimentação não encontrada', 404, 'MOVIMENTACAO_NOT_FOUND');
    }

    if (movimentacao.dataDevolucao) {
      return sendError(reply, 'Este item já foi devolvido', 400, 'ALREADY_RETURNED');
    }

    // Register return with today's date
    const today = new Date().toISOString().split('T')[0];
    await movimentacao.update({ dataDevolucao: today });

    // Fetch updated movimentacao with relations
    const updatedMovimentacao = await Movimentacao.findByPk(id, {
      include: [
        { model: Bem, as: 'bem' },
        { model: TipoMovimentacao, as: 'tipo' },
        { model: User, as: 'usuario' },
      ],
    });

    return sendSuccess(reply, updatedMovimentacao, 'Devolução registrada com sucesso');
  } catch (error: any) {
    return sendError(reply, error.message || 'Erro ao registrar devolução', 500, 'REGISTER_RETURN_ERROR');
  }
};
