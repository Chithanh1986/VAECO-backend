'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Flight_Plan extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    }
    Flight_Plan.init({
        datePlan: DataTypes.STRING,
        rev: DataTypes.STRING,
        ship: DataTypes.STRING,
        planData: DataTypes.TEXT,
        powerData: DataTypes.STRING,
        WOData: DataTypes.TEXT,
        shipLeader: DataTypes.STRING,
        handoverShip: DataTypes.STRING,
        driver: DataTypes.STRING,
        BDuty: DataTypes.STRING,
        powerSource: DataTypes.TEXT,
    }, {
        sequelize,
        freezeTableName: true,
        timestamps: false,
        modelName: 'Flight_Plan',
    });
    return Flight_Plan;
};