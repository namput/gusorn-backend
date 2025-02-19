const { DataTypes } = require("sequelize");
const sequelize = require("../config/database"); // ดึง sequelize จาก config
const User = require("./User"); // เชื่อมโยงกับโมเดล User

const TutorProfile = sequelize.define(
  "TutorProfile",
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
        model: User, // เชื่อมกับตาราง users
        key: "id",
      },
      onDelete: "CASCADE",
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    subject: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    experience: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    rating: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
  },
  {
    tableName: "tutor_profiles", // ตั้งชื่อตารางให้ตรงกับฐานข้อมูล
    timestamps: true, // ใช้ createdAt, updatedAt
  }
);

module.exports = TutorProfile;
