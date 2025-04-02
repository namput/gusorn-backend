const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Package = sequelize.define(
  "Package",
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    duration: {
      type: DataTypes.INTEGER, // จำนวนวัน เช่น 30 = 30 วัน
      allowNull: false,
    },
  },
  {
    tableName: "packages",
    timestamps: true,
  }
);

module.exports = Package;
