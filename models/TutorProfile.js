const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./User");

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
    email: { // ✅ เพิ่ม email
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        isEmail: true, // ✅ ตรวจสอบว่าเป็นอีเมลที่ถูกต้อง
      },
    },
    profileImage: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    introVideo: { // ✅ เพิ่ม introVideo
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
      type: DataTypes.TEXT,
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
    ageGroups: { // ✅ เพิ่ม ageGroups
      type: DataTypes.TEXT,
      allowNull: true,
      get() {
        return JSON.parse(this.getDataValue("ageGroups") || "[]");
      },
      set(value) {
        this.setDataValue("ageGroups", JSON.stringify(value));
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
  },
  {
    tableName: "tutor_profiles",
    timestamps: true,
  }
);

User.hasOne(TutorProfile, {
  foreignKey: "userId",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
TutorProfile.belongsTo(User, { foreignKey: "userId" });

module.exports = TutorProfile;
