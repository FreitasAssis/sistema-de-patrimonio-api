'use strict';

const { v4: uuidv4 } = require('uuid');

module.exports = {
  async up(queryInterface, Sequelize) {
    const tipos = [
      {
        id: uuidv4(),
        nome: 'empréstimo',
        descricao: 'Empréstimo de bem patrimonial',
        requer_devolucao: true,
        ativo: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        nome: 'devolução',
        descricao: 'Devolução de bem patrimonial emprestado',
        requer_devolucao: false,
        ativo: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];

    await queryInterface.bulkInsert('tipos_movimentacao', tipos, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('tipos_movimentacao', null, {});
  },
};
