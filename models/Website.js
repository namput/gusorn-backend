
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./User");

const Website = sequelize.define("Website", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: "id",
    },
    onDelete: "CASCADE",
  },
  subdomain: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
  },
  template: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  seoSettings: {
    type: DataTypes.JSON,
    allowNull: true,
  },
}, {
  tableName: "websites",
  timestamps: true,
});

module.exports = Website;