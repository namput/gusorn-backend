const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./User");

const Subscription = sequelize.define(
  "Subscription",
  {
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
    packageType: {
      type: DataTypes.ENUM("basic", "standard", "premium", "business"),
      allowNull: false,
    },
    price: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("pending", "active", "expired"),
      defaultValue: "pending", // ✅ เริ่มต้นเป็น pending
    },
    paymentMethod: {
      type: DataTypes.ENUM("qr", "bank"),
      allowNull: false,
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    tableName: "subscriptions",
    timestamps: true,
  }
);

module.exports = Subscription;
