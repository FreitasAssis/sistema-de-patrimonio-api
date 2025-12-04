import { Table, Column, Model, DataType, HasMany } from 'sequelize-typescript';
import { User } from './User';

@Table({
  tableName: 'perfis',
  timestamps: true,
})
export class Perfil extends Model {
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
    type: DataType.JSONB,
    allowNull: true,
    defaultValue: {},
    comment: 'Granular permissions for this role',
  })
  permissoes?: Record<string, any>;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  })
  ativo!: boolean;

  @HasMany(() => User)
  usuarios!: User[];
}

export default Perfil;
