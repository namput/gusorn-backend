const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./User");

const TutorProfile = sequelize.define(
  "TutorProfile",
  {
    id: {
      type: DataTypes.INTEGER, // ✅ เปลี่ยนจาก UUID เป็น INTEGER
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    profileImage: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    phone: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    location: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    subjects: {
      type: DataTypes.TEXT, // ✅ ใช้ TEXT แทน JSON
      allowNull: false,
      get() {
        return JSON.parse(this.getDataValue("subjects") || "[]");
      },
      set(value) {
        this.setDataValue("subjects", JSON.stringify(value));
      },
    },
    levels: {
      type: DataTypes.TEXT,
      allowNull: true,
      get() {
        return JSON.parse(this.getDataValue("levels") || "[]");
      },
      set(value) {
        this.setDataValue("levels", JSON.stringify(value));
      },
    },
    teachingMethods: {
      type: DataTypes.TEXT,
      allowNull: true,
      get() {
        return JSON.parse(this.getDataValue("teachingMethods") || "[]");
      },
      set(value) {
        this.setDataValue("teachingMethods", JSON.stringify(value));
      },
    },
    languages: {
      type: DataTypes.TEXT,
      allowNull: true,
      get() {
        return JSON.parse(this.getDataValue("languages") || "[]");
      },
      set(value) {
        this.setDataValue("languages", JSON.stringify(value));
      },
    },
    experience: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    price: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    availableLocations: {
      type: DataTypes.TEXT,
      allowNull: true,
      get() {
        return JSON.parse(this.getDataValue("availableLocations") || "[]");
      },
      set(value) {
        this.setDataValue("availableLocations", JSON.stringify(value));
      },
    },
    package: {
      type: DataTypes.ENUM("Free", "Premium", "Pro"),
      defaultValue: "Free",
    },
    courses: {
      type: DataTypes.TEXT,
      allowNull: true,
      get() {
        return JSON.parse(this.getDataValue("courses") || "[]");
      },
      set(value) {
        this.setDataValue("courses", JSON.stringify(value));
      },
    },
    schedule: {
      type: DataTypes.TEXT,
      allowNull: true,
      get() {
        return JSON.parse(this.getDataValue("schedule") || "[]");
      },
      set(value) {
        this.setDataValue("schedule", JSON.stringify(value));
      },
    },
    socialLinks: {
      type: DataTypes.TEXT,
      allowNull: true,
      get() {
        return JSON.parse(this.getDataValue("socialLinks") || "{}");
      },
      set(value) {
        this.setDataValue("socialLinks", JSON.stringify(value));
      },
    },
    websiteUrl: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  },
  {
    tableName: "tutor_profiles",
    timestamps: true,
  }
);

// ✅ กำหนดความสัมพันธ์ระหว่าง User และ TutorProfile
User.hasOne(TutorProfile, { foreignKey: "userId", onDelete: "CASCADE", onUpdate: "CASCADE" });
TutorProfile.belongsTo(User, { foreignKey: "userId" });

module.exports = TutorProfile;
