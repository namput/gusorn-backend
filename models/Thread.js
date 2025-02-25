const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./User");

const Thread = sequelize.define(
  "Thread",
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED, // ✅ ใช้ UNSIGNED ให้ตรงกับ `users.id`
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER.UNSIGNED, // ✅ ต้องใช้ UNSIGNED ให้ตรงกับ `users.id`
      allowNull: false,
      references: {
        model: "users", // ✅ ใช้ `users` ให้ตรงกับ `User.js`
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    tableName: "threads",
    timestamps: true, // ✅ ใช้ timestamps เพื่อให้ Sequelize จัดการ createdAt, updatedAt ให้อัตโนมัติ
    underscored: true, // ✅ ใช้ `underscored` ให้ตรงกับ `user_id` (ป้องกันปัญหากับ camelCase)
  }
);

// ✅ ตั้งค่าความสัมพันธ์
User.hasMany(Thread, { foreignKey: "user_id", onDelete: "CASCADE", onUpdate: "CASCADE" });
Thread.belongsTo(User, { foreignKey: "user_id" });

module.exports = Thread;
