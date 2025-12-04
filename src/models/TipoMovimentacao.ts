import { Table, Column, Model, DataType, HasMany } from 'sequelize-typescript';
import { Movimentacao } from './Movimentacao';

@Table({
  tableName: 'tipos_movimentacao',
  timestamps: true,
})
export class TipoMovimentacao extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  nome!: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  descricao?: string;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'If true, this movement type requires a return date (e.g., loan)',
  })
  requerDevolucao!: boolean;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  })
  ativo!: boolean;

  @HasMany(() => Movimentacao)
  movimentacoes!: Movimentacao[];
}

export default TipoMovimentacao;
