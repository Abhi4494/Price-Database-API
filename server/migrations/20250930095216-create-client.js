'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('client', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      client_unique_id: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      
      password: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null,
      },
      admin_id: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: "true => Active, false => Inactive",
      },
      apiKey: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null,
      },
      created_date: {
        type: Sequelize.DATEONLY,
        allowNull: true,
        defaultValue: null,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('client');
  }
};