import { FastifyRequest, FastifyReply } from 'fastify';
import { User, Perfil } from '../models';
import { LoginInput, ChangePasswordInput, RecoverPasswordInput } from '../schemas/auth.schema';
import { generateToken } from '../utils/jwt';
import { generateTempPassword } from '../utils/password';
import { sendSuccess, sendError } from '../utils/response';
import { UnauthorizedError, NotFoundError } from '../utils/errors';
import * as bcrypt from 'bcrypt';

export const login = async (
  request: FastifyRequest<{ Body: LoginInput }>,
  reply: FastifyReply
) => {
  try {
    const { email, password } = request.body;

    // Find user with perfil
    const user = await User.findOne({
      where: { email, ativo: true },
      include: [{ model: Perfil, as: 'perfil' }],
    });

    if (!user) {
      return sendError(reply, 'Credenciais inválidas', 401, 'INVALID_CREDENTIALS');
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return sendError(reply, 'Credenciais inválidas', 401, 'INVALID_CREDENTIALS');
    }

    // Generate JWT token
    const token = generateToken({
      id: user.id,
      email: user.email,
      perfilId: user.perfilId,
    });

    return sendSuccess(reply, {
      token,
      user: {
        id: user.id,
        email: user.email,
        perfil: user.perfil,
        emailRecuperacao: user.emailRecuperacao,
        tempPassword: user.tempPassword,
      },
    }, 'Login realizado com sucesso');
  } catch (error: any) {
    return sendError(reply, error.message || 'Erro ao fazer login', 500, 'LOGIN_ERROR');
  }
};

export const recoverPassword = async (
  request: FastifyRequest<{ Body: RecoverPasswordInput }>,
  reply: FastifyReply
) => {
  try {
    const { email, emailRecuperacao } = request.body;

    const user = await User.findOne({ where: { email, ativo: true } });

    if (!user) {
      return sendError(reply, 'Usuário não encontrado', 404, 'USER_NOT_FOUND');
    }

    if (user.emailRecuperacao !== emailRecuperacao) {
      return sendError(reply, 'Email de recuperação incorreto', 400, 'INVALID_RECOVERY_EMAIL');
    }

    // Generate temporary password
    const tempPassword = generateTempPassword();

    // Update user with temp password and flag
    user.password = tempPassword; // Will be hashed by Sequelize hook
    user.tempPassword = true;
    await user.save();

    return sendSuccess(reply, {
      senhaTemporaria: tempPassword,
    }, 'Senha temporária gerada com sucesso. Anote esta senha, ela não será exibida novamente.');
  } catch (error: any) {
    return sendError(reply, error.message || 'Erro ao recuperar senha', 500, 'RECOVERY_ERROR');
  }
};

export const changePassword = async (
  request: FastifyRequest<{ Body: ChangePasswordInput }>,
  reply: FastifyReply
) => {
  try {
    if (!request.user) {
      return sendError(reply, 'Usuário não autenticado', 401, 'UNAUTHORIZED');
    }

    const { novaSenha } = request.body;
    const userId = request.user.id;

    const user = await User.findByPk(userId);

    if (!user) {
      return sendError(reply, 'Usuário não encontrado', 404, 'USER_NOT_FOUND');
    }

    // Update password and remove temp flag
    user.password = novaSenha; // Will be hashed by Sequelize hook
    user.tempPassword = false;
    await user.save();

    return sendSuccess(reply, null, 'Senha alterada com sucesso');
  } catch (error: any) {
    return sendError(reply, error.message || 'Erro ao alterar senha', 500, 'CHANGE_PASSWORD_ERROR');
  }
};

export const logout = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  // Since we're using JWT, logout is handled client-side by removing the token
  // This endpoint exists for consistency and can be used for logging/analytics
  return sendSuccess(reply, null, 'Logout realizado com sucesso');
};

export const me = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    if (!request.user) {
      return sendError(reply, 'Usuário não autenticado', 401, 'UNAUTHORIZED');
    }

    const user = await User.findByPk(request.user.id, {
      include: [{ model: Perfil, as: 'perfil' }],
    });

    if (!user) {
      return sendError(reply, 'Usuário não encontrado', 404, 'USER_NOT_FOUND');
    }

    return sendSuccess(reply, {
      id: user.id,
      email: user.email,
      perfil: user.perfil,
      emailRecuperacao: user.emailRecuperacao,
      tempPassword: user.tempPassword,
    });
  } catch (error: any) {
    return sendError(reply, error.message || 'Erro ao buscar usuário', 500, 'GET_USER_ERROR');
  }
};
