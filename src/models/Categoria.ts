import { Table, Column, Model, DataType, HasMany } from 'sequelize-typescript';
import { Bem } from './Bem';

@Table({
  tableName: 'categorias',
  timestamps: true,
})
export class Categoria extends Model {
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
    defaultValue: true,
  })
  ativo!: boolean;

  @HasMany(() => Bem)
  bens!: Bem[];
}

export default Categoria;
