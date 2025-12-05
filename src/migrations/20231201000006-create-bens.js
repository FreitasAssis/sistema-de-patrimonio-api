'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('bens', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      tombo: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      nome: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      categoria_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'categorias',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      localizacao_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'localizacoes',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      sala: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      imagem_tombo: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      foto_bem: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      ativo: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // Add indexes
    await queryInterface.addIndex('bens', ['tombo']);
    await queryInterface.addIndex('bens', ['categoria_id']);
    await queryInterface.addIndex('bens', ['localizacao_id']);
    await queryInterface.addIndex('bens', ['ativo']);
    await queryInterface.addIndex('bens', ['nome']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('bens');
  },
};
