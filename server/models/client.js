"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Client extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Client.init(
    {
      client_unique_id: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },

      password: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
      },
      admin_id: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },

      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: "true => Active, false => Inactive",
      },
      apiKey: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
      },
      created_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        defaultValue: null,
      },
    },
    {
      sequelize,
      modelName: "Client",
      tableName: "client",
      freezeTableName: true,
    }
  );
  return Client;
};
