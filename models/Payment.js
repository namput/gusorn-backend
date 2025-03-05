const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./User");

const Payment = sequelize.define(
  "Payment",
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
      onUpdate: "CASCADE",
    },
    referredUserId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    amount: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("pending", "completed"),
      defaultValue: "pending",
    },
    paidAt: {
      type: DataTypes.DATE,
      allowNull: true, // ✅ วันเวลาที่จ่ายค่าคอมฯ
    },
  },
  {
    tableName: "payments",
    timestamps: true,
  }
);

// ✅ ตั้งค่าความสัมพันธ์
User.hasMany(Payment, { foreignKey: "referrerId", as: "commissionsReceived" });
Payment.belongsTo(User, { foreignKey: "referrerId", as: "referrer" });

User.hasMany(Payment, { foreignKey: "referredUserId", as: "commissionPaidFor" });
Payment.belongsTo(User, { foreignKey: "referredUserId", as: "referredUser" });

module.exports = Payment;
