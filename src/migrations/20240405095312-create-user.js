'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      vae_user: {
        type: Sequelize.STRING
      },
      vae_id: {
        type: Sequelize.STRING
      },
      surname: {
        type: Sequelize.STRING
      },
      name: {
        type: Sequelize.STRING
      },
      division: {
        type: Sequelize.STRING
      },
      station: {
        type: Sequelize.STRING
      },
      password: {
        type: Sequelize.STRING
      },
      group: {
        type: Sequelize.STRING
      },
      remark: {
        type: Sequelize.STRING
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Users');
  }
};