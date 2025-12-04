'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('perfis', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      nome: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      descricao: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      permissoes: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: {},
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
    await queryInterface.addIndex('perfis', ['nome']);
    await queryInterface.addIndex('perfis', ['ativo']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('perfis');
  },
};
