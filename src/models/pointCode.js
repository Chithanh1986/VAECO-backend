'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Point_code extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    }
    Point_code.init({
        airline: DataTypes.STRING,
        code: DataTypes.STRING,
        ACType: DataTypes.STRING,
        type: DataTypes.STRING,
        remark: DataTypes.STRING,
        CRSWHour: DataTypes.STRING,
        MECHWHour: DataTypes.STRING,
        CRSWPoint: DataTypes.STRING,
        MECHWPoint: DataTypes.STRING,
    }, {
        sequelize,
        freezeTableName: true,
        timestamps: false,
        modelName: 'Point_code',
    });
    return Point_code;
};