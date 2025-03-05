const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const User = sequelize.define(
  "User",
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
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    phone: {
      type: DataTypes.STRING(15),
      allowNull: false,
      validate: {
        isNumeric: true,
        len: [10, 15],
      },
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM("tutor", "admin"),
      allowNull: false,
      defaultValue: "tutor",
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    // ✅ เพิ่มรหัสเชิญ (Unique Code)
    referralCode: {
      type: DataTypes.STRING(10),
      allowNull: false,
      unique: true,
    },
    // ✅ เก็บ ID ของคนที่เชิญ (ถ้ามี)
    referrerId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      references: {
        model: "users",
        key: "id",
      },
      onDelete: "SET NULL",
    },
  },
  {
    tableName: "users",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["phone"],
      },
      {
        unique: true,
        fields: ["referralCode"], // ✅ ให้แน่ใจว่าไม่มีรหัสซ้ำ
      },
    ],
  }
);

module.exports = User;
