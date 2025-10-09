'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Material extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Material.init({
    client_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      series_name: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue:null
      },
  }, {
    sequelize,
    modelName: 'Material',
    tableName:"material",
    freezeTableName:true
  });
  return Material;
};