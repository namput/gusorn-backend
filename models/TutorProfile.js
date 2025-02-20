import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import User from "./User.js";

const TutorProfile = sequelize.define("TutorProfile", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: User,
      key: "id",
    },
    onDelete: "CASCADE",
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  profileImage: DataTypes.STRING,
  phone: DataTypes.STRING,
  location: DataTypes.STRING,
  bio: DataTypes.TEXT,
  subjects: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: false,
  },
  levels: DataTypes.ARRAY(DataTypes.STRING),
  teachingMethods: DataTypes.ARRAY(DataTypes.STRING),
  languages: DataTypes.ARRAY(DataTypes.STRING),
  experience: DataTypes.STRING,
  price: DataTypes.INTEGER,
  availableLocations: DataTypes.ARRAY(DataTypes.STRING),
  package: {
    type: DataTypes.ENUM("Free", "Premium", "Pro"),
    defaultValue: "Free",
  },
  courses: DataTypes.JSONB,
  schedule: DataTypes.JSONB,
  socialLinks: DataTypes.JSONB,
  websiteUrl: DataTypes.STRING,
});

// ✅ กำหนดความสัมพันธ์ระหว่าง User และ TutorProfile
User.hasOne(TutorProfile, { foreignKey: "userId", onDelete: "CASCADE" });
TutorProfile.belongsTo(User, { foreignKey: "userId" });

export default TutorProfile;
