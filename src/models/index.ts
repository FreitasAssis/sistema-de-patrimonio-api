import sequelize from '../config/database';

// Import model classes
import { Perfil } from './Perfil';
import { Categoria } from './Categoria';
import { Localizacao } from './Localizacao';
import { TipoMovimentacao } from './TipoMovimentacao';
import { User } from './User';
import { Bem } from './Bem';
import { Movimentacao } from './Movimentacao';

// Add models to Sequelize instance
sequelize.addModels([
  Perfil,
  Categoria,
  Localizacao,
  TipoMovimentacao,
  User,
  Bem,
  Movimentacao,
]);

// Re-export models
export { Perfil, Categoria, Localizacao, TipoMovimentacao, User, Bem, Movimentacao };

// Default export for Sequelize
export default sequelize;
