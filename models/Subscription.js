const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./User");

const Subscription = sequelize.define(
  "Subscription",
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED, // ✅ ใช้ UNSIGNED เพื่อให้ตรงกับ User.id
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER.UNSIGNED, // ✅ ต้องใช้ UNSIGNED ให้ตรงกัน
      allowNull: false,
      references: {
        model: "users", // ✅ เปลี่ยนจาก `User` เป็น `users` ให้ตรงกับ tableName ของ `User`
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    paymentId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    packageType: {
      type: DataTypes.ENUM("basic", "standard", "premium", "business"),
      allowNull: false,
    },
    price: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("pending", "active", "expired"),
      defaultValue: "pending",
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

// ✅ กำหนดความสัมพันธ์
User.hasMany(Subscription, { foreignKey: "userId", onDelete: "CASCADE", onUpdate: "CASCADE" });
Subscription.belongsTo(User, { foreignKey: "userId" });

module.exports = Subscription;
