import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import { Categoria } from './Categoria';
import { Localizacao } from './Localizacao';
import { Movimentacao } from './Movimentacao';

@Table({
  tableName: 'bens',
  timestamps: true,
})
export class Bem extends Model {
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
  tombo!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  nome!: string;

  @ForeignKey(() => Categoria)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  categoriaId!: string;

  @BelongsTo(() => Categoria)
  categoria!: Categoria;

  @ForeignKey(() => Localizacao)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  localizacaoId!: string;

  @BelongsTo(() => Localizacao)
  localizacao!: Localizacao;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  sala!: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
    comment: 'Base64 encoded image of the tombstone (PNG)',
  })
  imagemTombo?: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
    comment: 'Base64 encoded photo of the item (JPEG)',
  })
  fotoBem?: string;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  })
  ativo!: boolean;

  @HasMany(() => Movimentacao)
  movimentacoes!: Movimentacao[];
}

export default Bem;
