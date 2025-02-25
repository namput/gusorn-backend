const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./User");
const Thread = require("./Thread");

const Reply = sequelize.define(
  "Reply",
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED, // ✅ ใช้ UNSIGNED ให้ตรงกับ Foreign Key
      autoIncrement: true,
      primaryKey: true,
    },
    thread_id: {
      type: DataTypes.INTEGER.UNSIGNED, // ✅ ใช้ UNSIGNED ให้ตรงกับ `Threads.id`
      allowNull: false,
      references: {
        model: Thread, // ✅ แก้เป็น Model โดยตรง (ไม่ใช้ "threads" เป็น string)
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    user_id: {
      type: DataTypes.INTEGER.UNSIGNED, // ✅ ใช้ UNSIGNED ให้ตรงกับ `Users.id`
      allowNull: false,
      references: {
        model: User, // ✅ แก้เป็น Model โดยตรง (ไม่ใช้ "users" เป็น string)
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    tableName: "replies",
    timestamps: true, // ✅ ใช้ timestamps เพื่อให้ Sequelize จัดการ createdAt, updatedAt ให้อัตโนมัติ
  }
);

// ✅ ตั้งค่าความสัมพันธ์
User.hasMany(Reply, { foreignKey: "user_id", onDelete: "CASCADE", onUpdate: "CASCADE" });
Reply.belongsTo(User, { foreignKey: "user_id", as: "User" });

Thread.hasMany(Reply, { foreignKey: "thread_id", onDelete: "CASCADE", onUpdate: "CASCADE" });
Reply.belongsTo(Thread, { foreignKey: "thread_id", as: "Thread" });

module.exports = Reply;
