import { FastifyRequest, FastifyReply } from 'fastify';
import { verifyToken, JwtPayload } from '../utils/jwt';
import { UnauthorizedError } from '../utils/errors';
import { sendError } from '../utils/response';

declare module 'fastify' {
  interface FastifyRequest {
    user?: JwtPayload;
  }
}

export const authenticate = async (
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> => {
  try {
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      return sendError(
        reply,
        'Token de autenticação não fornecido',
        401,
        'MISSING_TOKEN'
      );
    }

    const parts = authHeader.split(' ');

    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return sendError(
        reply,
        'Formato de token inválido. Use: Bearer <token>',
        401,
        'INVALID_TOKEN_FORMAT'
      );
    }

    const token = parts[1];

    try {
      const decoded = verifyToken(token);
      request.user = decoded;
    } catch (error) {
      return sendError(
        reply,
        'Token inválido ou expirado',
        401,
        'INVALID_TOKEN'
      );
    }
  } catch (error) {
    return sendError(
      reply,
      'Erro na autenticação',
      500,
      'AUTH_ERROR'
    );
  }
};

export const requireAdmin = async (
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> => {
  if (!request.user) {
    return sendError(
      reply,
      'Usuário não autenticado',
      401,
      'UNAUTHORIZED'
    );
  }

  // Query database to check if user has admin perfil
  try {
    const { User, Perfil } = await import('../models');

    const user = await User.findByPk(request.user.id, {
      include: [{ model: Perfil, as: 'perfil' }],
    });

    if (!user) {
      return sendError(
        reply,
        'Usuário não encontrado',
        404,
        'USER_NOT_FOUND'
      );
    }

    if (!user.ativo) {
      return sendError(
        reply,
        'Usuário inativo',
        403,
        'USER_INACTIVE'
      );
    }

    if (user.perfil?.nome !== 'ADMIN') {
      return sendError(
        reply,
        'Acesso negado. Apenas administradores podem acessar este recurso.',
        403,
        'FORBIDDEN'
      );
    }
  } catch (error) {
    return sendError(
      reply,
      'Erro ao verificar permissões',
      500,
      'PERMISSION_CHECK_ERROR'
    );
  }
};
