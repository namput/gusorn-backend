const sequelize = require("./config/database");
const User = require("./models/User");
const TutorProfile = require("./models/TutorProfile");
const Subscription = require("./models/Subscription");
const Website = require("./models/Website");

async function syncDatabase() {
  try {
    await sequelize.sync({ alter: true });
    console.log("✅ ซิงค์ฐานข้อมูลสำเร็จ!");
  } catch (error) {
    console.error("❌ เกิดข้อผิดพลาดในการซิงค์ฐานข้อมูล:", error);
  } finally {
    await sequelize.close();
  }
}

syncDatabase();