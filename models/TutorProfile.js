const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./User");

const TutorProfile = sequelize.define(
  "TutorProfile",
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED, // ✅ ใช้ UNSIGNED เพื่อให้ตรงกับ users.id
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER.UNSIGNED, // ✅ ตรงกับ users.id
      allowNull: false,
      references: {
        model: User, // ✅ ใช้ model เป็น User แทน "users"
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
    profileImage: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    introVideo: {
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
    subdomain: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    template: {
      type: DataTypes.STRING(255),
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
    ageGroups: {
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

// ✅ ตั้งค่า Relationship ให้ถูกต้อง
User.hasOne(TutorProfile, {
  foreignKey: "userId",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
TutorProfile.belongsTo(User, { foreignKey: "userId" });

module.exports = TutorProfile;
