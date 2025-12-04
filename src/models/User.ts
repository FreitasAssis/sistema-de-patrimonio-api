import { Table, Column, Model, DataType, ForeignKey, BelongsTo, BeforeCreate, BeforeUpdate, HasMany } from 'sequelize-typescript';
import * as bcrypt from 'bcrypt';
import { Perfil } from './Perfil';
import { Movimentacao } from './Movimentacao';

@Table({
  tableName: 'usuarios',
  timestamps: true,
})
export class User extends Model {
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
    validate: {
      isEmail: true,
    },
  })
  email!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  password!: string;

  @ForeignKey(() => Perfil)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  perfilId!: string;

  @BelongsTo(() => Perfil)
  perfil!: Perfil;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  emailRecuperacao?: string;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  tempPassword!: boolean;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  })
  ativo!: boolean;

  @HasMany(() => Movimentacao)
  movimentacoes!: Movimentacao[];

  // Hash password before saving
  @BeforeCreate
  @BeforeUpdate
  static async hashPassword(user: User) {
    if (user.changed('password')) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(user.password, salt);
    }
  }

  // Method to compare passwords
  async comparePassword(candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
  }

  // Hide password in JSON responses
  toJSON() {
    const values = { ...this.get() };
    delete values.password;
    return values;
  }
}

export default User;
