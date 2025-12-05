import { z } from 'zod';

export const createMovimentacaoSchema = z.object({
  bemId: z.string().uuid('ID de bem inválido'),
  tombo: z.string().min(1, 'Tombo é obrigatório'),
  nomeItem: z.string().min(1, 'Nome do item é obrigatório'),
  tipoId: z.string().uuid('ID de tipo inválido'),
  pessoa: z.string().min(1, 'Pessoa é obrigatória'),
  contato: z.string().min(1, 'Contato é obrigatório'),
  pastoral: z.string().min(1, 'Pastoral é obrigatória'),
  observacao: z.string().max(500, 'Observação deve ter no máximo 500 caracteres').optional().nullable(),
  dataEmprestimo: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD'),
  dataDevolucao: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD').optional().nullable(),
});

export const updateMovimentacaoSchema = z.object({
  dataDevolucao: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD').nullable(),
  observacao: z.string().max(500, 'Observação deve ter no máximo 500 caracteres').optional().nullable(),
});

export type CreateMovimentacaoInput = z.infer<typeof createMovimentacaoSchema>;
export type UpdateMovimentacaoInput = z.infer<typeof updateMovimentacaoSchema>;
