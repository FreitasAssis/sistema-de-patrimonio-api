import { z } from 'zod';

export const createUserSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  perfilId: z.string().uuid('ID de perfil inválido'),
  emailRecuperacao: z.string().email('Email de recuperação inválido').optional(),
});

export const updateUserSchema = z.object({
  email: z.string().email('Email inválido').optional(),
  perfilId: z.string().uuid('ID de perfil inválido').optional(),
  emailRecuperacao: z.string().email('Email de recuperação inválido').optional(),
  ativo: z.boolean().optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
