'use strict';

const { v4: uuidv4 } = require('uuid');

module.exports = {
  async up(queryInterface, Sequelize) {
    const localizacoes = [
      {
        id: uuidv4(),
        nome: 'igreja matriz',
        endereco: null,
        responsavel: null,
        telefone: null,
        ativo: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        nome: 'igreja do P.O',
        endereco: null,
        responsavel: null,
        telefone: null,
        ativo: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        nome: 'igreja do P.I',
        endereco: null,
        responsavel: null,
        telefone: null,
        ativo: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];

    await queryInterface.bulkInsert('localizacoes', localizacoes, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('localizacoes', null, {});
  },
};
