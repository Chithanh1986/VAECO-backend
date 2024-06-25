'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Flight_Plan', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      datePlan: {
        type: Sequelize.STRING
      },
      rev: {
        type: Sequelize.STRING
      },
      ship: {
        type: Sequelize.STRING
      },
      planData: {
        type: Sequelize.TEXT
      },
      powerData: {
        type: Sequelize.STRING
      },

    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Flight_Plan');
  }
};