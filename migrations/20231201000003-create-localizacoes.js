'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('localizacoes', {
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
      endereco: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      responsavel: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      telefone: {
        type: Sequelize.STRING,
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
    await queryInterface.addIndex('localizacoes', ['nome']);
    await queryInterface.addIndex('localizacoes', ['ativo']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('localizacoes');
  },
};
