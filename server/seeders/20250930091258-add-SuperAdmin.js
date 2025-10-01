'use strict';
const bcrypt = require('bcryptjs');
const db = require('../models');
const { SuperAdmin } = db;
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */

    const passwordHash = await bcrypt.hash('admin@321', 10);
    const email = 'admin@gmail.com';
 
    const [admin, created] = await SuperAdmin.findOrCreate({
      where: { email },
      defaults: {
        name: 'Super Admin',
        mobile: '9999988779',
        password: passwordHash,
        is_active: true,
      }
    });
 
    if (created) {
      console.log(`✅ SuperAdmin with email "${email}" created.`);
    } else {
      console.log(`⚠️ SuperAdmin with email "${email}" already exists.`);
    }



  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */

    const email = 'admin@gmail.com';
    const deleted = await SuperAdmin.destroy({ where: { email } });
 
    if (deleted) {
      console.log(`🗑️ SuperAdmin with email "${email}" deleted.`);
    } else {
      console.log(`❌ No SuperAdmin with email "${email}" found to delete.`);
    }

  }
};
