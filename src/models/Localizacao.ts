import { Table, Column, Model, DataType, HasMany } from 'sequelize-typescript';
import { Bem } from './Bem';

@Table({
  tableName: 'localizacoes',
  timestamps: true,
})
export class Localizacao extends Model {
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
  endereco?: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  responsavel?: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  telefone?: string;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  })
  ativo!: boolean;

  @HasMany(() => Bem)
  bens!: Bem[];
}

export default Localizacao;
