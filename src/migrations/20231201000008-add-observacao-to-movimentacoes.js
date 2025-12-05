'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('movimentacoes', 'observacao', {
      type: Sequelize.TEXT,
      allowNull: true,
      after: 'pastoral',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('movimentacoes', 'observacao');
  },
};
