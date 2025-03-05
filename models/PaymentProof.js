const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./User");

const PaymentProof = sequelize.define(
  "PaymentProof",
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    packageId: {
      type: DataTypes.ENUM("basic", "standard", "premium", "business"), // ✅ ใช้ ENUM แทน String
      allowNull: false,
    },
    amount: {
      type: DataTypes.FLOAT, // ✅ เพิ่ม field บันทึกยอดเงินที่จ่าย
      allowNull: false,
    },
    paymentMethod: {
      type: DataTypes.ENUM("qr", "bank"),
      allowNull: false,
    },
    proofUrl: {
      type: DataTypes.TEXT, // ✅ ใช้ TEXT เพื่อรองรับ URL ที่ยาว
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("pending", "approved", "rejected"),
      defaultValue: "pending",
    },
  },
  {
    tableName: "payment_proofs",
    timestamps: true,
  }
);

// ✅ ตั้งค่าความสัมพันธ์
User.hasMany(PaymentProof, { foreignKey: "userId", onDelete: "CASCADE", onUpdate: "CASCADE" });
PaymentProof.belongsTo(User, { foreignKey: "userId" });

module.exports = PaymentProof;
