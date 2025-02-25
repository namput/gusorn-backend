const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./User");

const Website = sequelize.define(
  "Website",
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED, // ✅ ต้องเป็น UNSIGNED ให้ตรงกับ User.id
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER.UNSIGNED, // ✅ ต้องใช้ UNSIGNED ให้ตรงกับ users.id
      allowNull: false,
      references: {
        model: "users", // ✅ ใช้ชื่อ table ที่ตรงกับ `User.js`
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    subdomain: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    template: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    seoSettings: {
      type: DataTypes.TEXT, // ✅ เปลี่ยนจาก JSON เป็น TEXT เพื่อรองรับทุกเวอร์ชัน MySQL
      allowNull: true,
      get() {
        return JSON.parse(this.getDataValue("seoSettings") || "{}");
      },
      set(value) {
        this.setDataValue("seoSettings", JSON.stringify(value));
      },
    },
  },
  {
    tableName: "websites",
    timestamps: true,
  }
);

// ✅ ตั้งค่าความสัมพันธ์
User.hasMany(Website, { foreignKey: "userId", onDelete: "CASCADE", onUpdate: "CASCADE" });
Website.belongsTo(User, { foreignKey: "userId" });

module.exports = Website;
