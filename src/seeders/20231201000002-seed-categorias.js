'use strict';

const { v4: uuidv4 } = require('uuid');

module.exports = {
  async up(queryInterface, Sequelize) {
    const categorias = [
      {
        id: uuidv4(),
        nome: 'móvel',
        descricao: 'Móveis e mobiliário em geral',
        ativo: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        nome: 'objeto litúrgico',
        descricao: 'Objetos utilizados em cerimônias litúrgicas',
        ativo: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        nome: 'eletrônico',
        descricao: 'Equipamentos eletrônicos e tecnológicos',
        ativo: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];

    await queryInterface.bulkInsert('categorias', categorias, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('categorias', null, {});
  },
};
