'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Users extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      // Users.belongsTo(models.Group)
    }
  }
  Users.init({
    vae_user: DataTypes.STRING,
    vae_id: DataTypes.STRING,
    surname: DataTypes.STRING,
    name: DataTypes.STRING,
    division: DataTypes.STRING,
    station: DataTypes.STRING,
    password: DataTypes.STRING,
    group: DataTypes.STRING,
    remark: DataTypes.STRING,
  }, {
    sequelize,
    timestamps: false,
    modelName: 'Users',
  });
  return Users;
};