'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('Point_code', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            airline: {
                type: Sequelize.STRING
            },
            code: {
                type: Sequelize.STRING
            },
            ACType: {
                type: Sequelize.STRING
            },
            type: {
                type: Sequelize.STRING
            },
            maxTime: {
                type: Sequelize.STRING
            },
            remark: {
                type: Sequelize.STRING
            },
            CRSWHour: {
                type: Sequelize.STRING
            },
            MECHWHour: {
                type: Sequelize.STRING
            },
            CRSWPoint: {
                type: Sequelize.STRING
            },
            MECHWPoint: {
                type: Sequelize.STRING
            },
        });
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('Point_code');
    }
};