import { z } from 'zod';

// Generic schema for reference tables (Perfil, Categoria, Localizacao, TipoMovimentacao)
export const createReferenceSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  descricao: z.string().optional(),
});

export const updateReferenceSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório').optional(),
  descricao: z.string().optional(),
  ativo: z.boolean().optional(),
});

// Specific schemas
export const createLocalizacaoSchema = createReferenceSchema.extend({
  endereco: z.string().optional(),
  responsavel: z.string().optional(),
  telefone: z.string().optional(),
});

export const updateLocalizacaoSchema = updateReferenceSchema.extend({
  endereco: z.string().optional(),
  responsavel: z.string().optional(),
  telefone: z.string().optional(),
});

export const createPerfilSchema = createReferenceSchema.extend({
  permissoes: z.record(z.any()).optional(),
});

export const updatePerfilSchema = updateReferenceSchema.extend({
  permissoes: z.record(z.any()).optional(),
});

export const createTipoMovimentacaoSchema = createReferenceSchema.extend({
  requerDevolucao: z.boolean().default(false),
});

export const updateTipoMovimentacaoSchema = updateReferenceSchema.extend({
  requerDevolucao: z.boolean().optional(),
});

export type CreateReferenceInput = z.infer<typeof createReferenceSchema>;
export type UpdateReferenceInput = z.infer<typeof updateReferenceSchema>;
export type CreateLocalizacaoInput = z.infer<typeof createLocalizacaoSchema>;
export type UpdateLocalizacaoInput = z.infer<typeof updateLocalizacaoSchema>;
export type CreatePerfilInput = z.infer<typeof createPerfilSchema>;
export type UpdatePerfilInput = z.infer<typeof updatePerfilSchema>;
export type CreateTipoMovimentacaoInput = z.infer<typeof createTipoMovimentacaoSchema>;
export type UpdateTipoMovimentacaoInput = z.infer<typeof updateTipoMovimentacaoSchema>;
