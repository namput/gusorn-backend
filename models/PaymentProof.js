const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./User");

const PaymentProof = sequelize.define(
  "PaymentProof",
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED, // ✅ ใช้ UNSIGNED ให้ตรงกับ Foreign Key
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER.UNSIGNED, // ✅ ต้องเป็น UNSIGNED ให้ตรงกับ users.id
      allowNull: false,
      references: {
        model: "users", // ✅ ใช้ชื่อ table ที่ตรงกับ `User.js`
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    packageId: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    paymentMethod: {
      type: DataTypes.ENUM("qr", "bank"),
      allowNull: false,
    },
    proofUrl: {
      type: DataTypes.STRING,
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
