import { z } from 'zod';

export const createBemSchema = z.object({
  tombo: z.string().min(1, 'Tombo é obrigatório'),
  nome: z.string().min(1, 'Nome é obrigatório'),
  categoriaId: z.string().uuid('ID de categoria inválido'),
  localizacaoId: z.string().uuid('ID de localização inválido'),
  sala: z.string().min(1, 'Sala é obrigatória'),
  imagemTombo: z.string().optional(),
  fotoBem: z.string().optional(),
});

export const updateBemSchema = z.object({
  tombo: z.string().min(1, 'Tombo é obrigatório').optional(),
  nome: z.string().min(1, 'Nome é obrigatório').optional(),
  categoriaId: z.string().uuid('ID de categoria inválido').optional(),
  localizacaoId: z.string().uuid('ID de localização inválido').optional(),
  sala: z.string().min(1, 'Sala é obrigatória').optional(),
  imagemTombo: z.string().optional(),
  fotoBem: z.string().optional(),
  ativo: z.boolean().optional(),
});

export type CreateBemInput = z.infer<typeof createBemSchema>;
export type UpdateBemInput = z.infer<typeof updateBemSchema>;
