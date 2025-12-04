import { FastifyRequest, FastifyReply } from 'fastify';
import { User, Perfil } from '../models';
import { CreateUserInput, UpdateUserInput } from '../schemas/user.schema';
import { sendSuccess, sendError, sendCreated, sendNoContent } from '../utils/response';
import { NotFoundError, ConflictError } from '../utils/errors';

export const getAllUsers = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const users = await User.findAll({
      include: [{ model: Perfil, as: 'perfil' }],
      order: [['createdAt', 'DESC']],
    });

    return sendSuccess(reply, users);
  } catch (error: any) {
    return sendError(reply, error.message || 'Erro ao buscar usuários', 500, 'GET_USERS_ERROR');
  }
};

export const getUserById = async (
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) => {
  try {
    const { id } = request.params;

    const user = await User.findByPk(id, {
      include: [{ model: Perfil, as: 'perfil' }],
    });

    if (!user) {
      return sendError(reply, 'Usuário não encontrado', 404, 'USER_NOT_FOUND');
    }

    return sendSuccess(reply, user);
  } catch (error: any) {
    return sendError(reply, error.message || 'Erro ao buscar usuário', 500, 'GET_USER_ERROR');
  }
};

export const createUser = async (
  request: FastifyRequest<{ Body: CreateUserInput }>,
  reply: FastifyReply
) => {
  try {
    const { email, password, perfilId, emailRecuperacao } = request.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return sendError(reply, 'Usuário com este email já existe', 409, 'USER_EXISTS');
    }

    // Verify perfil exists
    const perfil = await Perfil.findByPk(perfilId);
    if (!perfil) {
      return sendError(reply, 'Perfil não encontrado', 404, 'PERFIL_NOT_FOUND');
    }

    // Create user (password will be hashed by Sequelize hook)
    const user = await User.create({
      email,
      password,
      perfilId,
      emailRecuperacao,
      tempPassword: false,
      ativo: true,
    });

    // Fetch user with perfil to return
    const createdUser = await User.findByPk(user.id, {
      include: [{ model: Perfil, as: 'perfil' }],
    });

    return sendCreated(reply, createdUser, 'Usuário criado com sucesso');
  } catch (error: any) {
    return sendError(reply, error.message || 'Erro ao criar usuário', 500, 'CREATE_USER_ERROR');
  }
};

export const updateUser = async (
  request: FastifyRequest<{ Params: { id: string }; Body: UpdateUserInput }>,
  reply: FastifyReply
) => {
  try {
    const { id } = request.params;
    const updates = request.body;

    const user = await User.findByPk(id);

    if (!user) {
      return sendError(reply, 'Usuário não encontrado', 404, 'USER_NOT_FOUND');
    }

    // Check if trying to update admin default user email
    if (user.email === 'admin@email.com' && updates.email && updates.email !== user.email) {
      return sendError(reply, 'Não é possível alterar o email do administrador padrão', 400, 'CANNOT_UPDATE_ADMIN');
    }

    // If updating email, check uniqueness
    if (updates.email && updates.email !== user.email) {
      const existingUser = await User.findOne({ where: { email: updates.email } });
      if (existingUser) {
        return sendError(reply, 'Email já está em uso', 409, 'EMAIL_IN_USE');
      }
    }

    // If updating perfilId, verify it exists
    if (updates.perfilId) {
      const perfil = await Perfil.findByPk(updates.perfilId);
      if (!perfil) {
        return sendError(reply, 'Perfil não encontrado', 404, 'PERFIL_NOT_FOUND');
      }
    }

    // Update user
    await user.update(updates);

    // Fetch updated user with perfil
    const updatedUser = await User.findByPk(id, {
      include: [{ model: Perfil, as: 'perfil' }],
    });

    return sendSuccess(reply, updatedUser, 'Usuário atualizado com sucesso');
  } catch (error: any) {
    return sendError(reply, error.message || 'Erro ao atualizar usuário', 500, 'UPDATE_USER_ERROR');
  }
};

export const deleteUser = async (
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) => {
  try {
    const { id } = request.params;

    const user = await User.findByPk(id);

    if (!user) {
      return sendError(reply, 'Usuário não encontrado', 404, 'USER_NOT_FOUND');
    }

    // Prevent deletion of default admin
    if (user.email === 'admin@email.com') {
      return sendError(reply, 'Não é possível excluir o administrador padrão', 400, 'CANNOT_DELETE_ADMIN');
    }

    // Soft delete by setting ativo to false
    await user.update({ ativo: false });

    return sendSuccess(reply, null, 'Usuário excluído com sucesso');
  } catch (error: any) {
    return sendError(reply, error.message || 'Erro ao excluir usuário', 500, 'DELETE_USER_ERROR');
  }
};
