'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('material_price', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      client_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      series_name: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue:null
      },
      region: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue:null
      },
      inco_term: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue:null
      },
      unit_of_measurement: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue:null
      },
      currency: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue:null
      },
      measurment_type: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue:null
      },
      price_date: {
        type: Sequelize.DATEONLY,
        allowNull: true,
        defaultValue:null
      },
      price_origin_value: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue:null
      },
      price: {
        type: Sequelize.DOUBLE(10, 2),
        allowNull: true,
        defaultValue:null
      },
      admin_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
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
    await queryInterface.dropTable('material_price');
  }
};