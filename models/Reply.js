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
      type: DataTypes.INTEGER.UNSIGNED, // ✅ ต้องใช้ UNSIGNED ให้ตรงกับ `Threads.id`
      allowNull: false,
      references: {
        model: "threads", // ✅ ต้องใช้ `threads` ให้ตรงกับ `Thread.js`
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    user_id: {
      type: DataTypes.INTEGER.UNSIGNED, // ✅ ต้องใช้ UNSIGNED ให้ตรงกับ `Users.id`
      allowNull: false,
      references: {
        model: "users", // ✅ ต้องใช้ `users` ให้ตรงกับ `User.js`
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
Reply.belongsTo(User, { foreignKey: "user_id" });

Thread.hasMany(Reply, { foreignKey: "thread_id", onDelete: "CASCADE", onUpdate: "CASCADE" });
Reply.belongsTo(Thread, { foreignKey: "thread_id" });

module.exports = Reply;
