const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED, // ✅ ใช้ UNSIGNED ให้ตรงกับ foreign key ใน Subscription
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
      type: DataTypes.STRING(15), // ✅ เพิ่มหมายเลขโทรศัพท์
      allowNull: false,
      unique: true, // ✅ ป้องกันเบอร์โทรซ้ำ
      validate: {
        isNumeric: true, // ✅ ต้องเป็นตัวเลขเท่านั้น
        len: [10, 15], // ✅ จำกัดให้เบอร์โทรศัพท์มี 10-15 หลัก
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
  },
  {
    tableName: "users", // ✅ กำหนด tableName ให้ตรงกับที่ใช้อ้างอิงใน Subscription
    timestamps: true,
  }
);

module.exports = User;
