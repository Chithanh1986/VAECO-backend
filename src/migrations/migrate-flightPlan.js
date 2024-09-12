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
      station: {
        type: Sequelize.STRING
      },
      WOData: {
        type: Sequelize.TEXT
      },
      shipLeader: {
        type: Sequelize.STRING
      },
      handoverShip: {
        type: Sequelize.STRING
      },
      driver: {
        type: Sequelize.STRING
      },
      BDuty: {
        type: Sequelize.STRING
      },
      powerSource: {
        type: Sequelize.TEXT
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Flight_Plan');
  }
};