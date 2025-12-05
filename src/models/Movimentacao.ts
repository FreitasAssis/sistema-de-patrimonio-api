import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Bem } from './Bem';
import { TipoMovimentacao } from './TipoMovimentacao';
import { User } from './User';

@Table({
  tableName: 'movimentacoes',
  timestamps: true,
})
export class Movimentacao extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id!: string;

  @ForeignKey(() => Bem)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  bemId!: string;

  @BelongsTo(() => Bem)
  bem!: Bem;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    comment: 'Kept for historical reference and quick lookup',
  })
  tombo!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  nomeItem!: string;

  @ForeignKey(() => TipoMovimentacao)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  tipoId!: string;

  @BelongsTo(() => TipoMovimentacao)
  tipo!: TipoMovimentacao;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  pessoa!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  contato!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  pastoral!: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
    validate: {
      len: [0, 500],
    },
  })
  observacao?: string | null;

  @Column({
    type: DataType.DATEONLY,
    allowNull: false,
  })
  dataEmprestimo!: string;

  @Column({
    type: DataType.DATEONLY,
    allowNull: true,
  })
  dataDevolucao?: string | null;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: true,
    comment: 'User who registered this movement',
  })
  usuarioId?: string;

  @BelongsTo(() => User)
  usuario?: User;
}

export default Movimentacao;
