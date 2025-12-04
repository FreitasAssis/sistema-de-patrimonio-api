import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
});

export const changePasswordSchema = z.object({
  novaSenha: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
});

export const recoverPasswordSchema = z.object({
  email: z.string().email('Email inválido'),
  emailRecuperacao: z.string().email('Email de recuperação inválido'),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type RecoverPasswordInput = z.infer<typeof recoverPasswordSchema>;
