'use strict';

const { v4: uuidv4 } = require('uuid');

module.exports = {
  async up(queryInterface, Sequelize) {
    const perfis = [
      {
        id: uuidv4(),
        nome: 'ADMIN',
        descricao: 'Administrador com acesso total ao sistema',
        permissoes: JSON.stringify({
          usuarios: { criar: true, editar: true, excluir: true, visualizar: true },
          bens: { criar: true, editar: true, excluir: true, visualizar: true },
          movimentacoes: { criar: true, editar: true, excluir: true, visualizar: true },
          relatorios: { visualizar: true, exportar: true },
          configuracoes: { editar: true },
        }),
        ativo: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        nome: 'USER',
        descricao: 'Usuário padrão com permissões limitadas',
        permissoes: JSON.stringify({
          usuarios: { criar: false, editar: false, excluir: false, visualizar: false },
          bens: { criar: true, editar: true, excluir: false, visualizar: true },
          movimentacoes: { criar: true, editar: false, excluir: false, visualizar: true },
          relatorios: { visualizar: true, exportar: false },
          configuracoes: { editar: false },
        }),
        ativo: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];

    await queryInterface.bulkInsert('perfis', perfis, {});

    // Store the ADMIN perfil ID for use in the users seed
    const adminPerfil = await queryInterface.sequelize.query(
      `SELECT id FROM perfis WHERE nome = 'ADMIN' LIMIT 1;`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    if (adminPerfil.length > 0) {
      global.ADMIN_PERFIL_ID = adminPerfil[0].id;
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('perfis', null, {});
  },
};
