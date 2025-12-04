'use strict';

const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');

module.exports = {
  async up(queryInterface, Sequelize) {
    // Get the ADMIN perfil ID
    const adminPerfil = await queryInterface.sequelize.query(
      `SELECT id FROM perfis WHERE nome = 'ADMIN' LIMIT 1;`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    if (adminPerfil.length === 0) {
      throw new Error('ADMIN perfil not found. Make sure to run perfis seed first.');
    }

    const adminPerfilId = adminPerfil[0].id;

    // Hash the password
    const hashedPassword = await bcrypt.hash('admin123', 10);

    const adminUser = {
      id: uuidv4(),
      email: 'admin@email.com',
      password: hashedPassword,
      perfil_id: adminPerfilId,
      email_recuperacao: 'admin@patrimonio.com',
      temp_password: false,
      ativo: true,
      created_at: new Date(),
      updated_at: new Date(),
    };

    await queryInterface.bulkInsert('usuarios', [adminUser], {});

    console.log('✅ Default admin user created:');
    console.log('   Email: admin@email.com');
    console.log('   Password: admin123');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('usuarios', { email: 'admin@email.com' }, {});
  },
};
