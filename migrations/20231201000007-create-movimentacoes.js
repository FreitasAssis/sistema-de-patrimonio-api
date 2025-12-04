'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('movimentacoes', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      bem_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'bens',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      tombo: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      nome_item: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      tipo_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'tipos_movimentacao',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      pessoa: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      contato: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      pastoral: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      data_emprestimo: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      data_devolucao: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      usuario_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'usuarios',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
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
    await queryInterface.addIndex('movimentacoes', ['bem_id']);
    await queryInterface.addIndex('movimentacoes', ['tombo']);
    await queryInterface.addIndex('movimentacoes', ['tipo_id']);
    await queryInterface.addIndex('movimentacoes', ['usuario_id']);
    await queryInterface.addIndex('movimentacoes', ['data_emprestimo']);
    await queryInterface.addIndex('movimentacoes', ['data_devolucao']);
    // Composite index for finding active loans
    await queryInterface.addIndex('movimentacoes', ['tombo', 'data_devolucao']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('movimentacoes');
  },
};
