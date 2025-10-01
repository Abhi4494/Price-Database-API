"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class MaterialPrice extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  MaterialPrice.init(
    {
      client_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      series_name: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
      },
      region: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
      },
      inco_term: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
      },
      unit_of_measurement: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
      },
      currency: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
      },
      measurment_type: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
      },
      price_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        defaultValue: null,
      },
      price_origin_value: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
      },
      price: {
        type: DataTypes.DOUBLE(10, 2),
        allowNull: true,
        defaultValue: null,
      },
      admin_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "MaterialPrice",
      tableName: "material_price",
      freezeTableName: true,
    }
  );
  return MaterialPrice;
};
