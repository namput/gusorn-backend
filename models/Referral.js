const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Referral = sequelize.define(
  "Referral",
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    referrerId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
      onDelete: "CASCADE",
    },
    referredUserId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
      onDelete: "CASCADE",
    },
    commission: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("pending", "paid"),
      defaultValue: "pending",
    },
  },
  {
    tableName: "referrals",
    timestamps: true,
  }
);

module.exports = Referral;
