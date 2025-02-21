const sequelize = require("./config/database");
const User = require("./models/User");
const TutorProfile = require("./models/TutorProfile");
const Subscription = require("./models/Subscription");
const Website = require("./models/Website");

async function syncDatabase() {
  try {
    console.log("🔄 กำลังซิงค์ฐานข้อมูล...");
    await sequelize.sync({ alter: true }); // ✅ อัปเดตโครงสร้างโดยไม่ลบข้อมูลเดิม
    console.log("✅ ซิงค์ฐานข้อมูลสำเร็จ!");
  } catch (error) {
    console.error("❌ เกิดข้อผิดพลาดในการซิงค์ฐานข้อมูล:", error);
  } finally {
    await sequelize.close(); // ✅ ปิด Connection เพื่อป้องกันการค้าง
    process.exit(); // ✅ ออกจากโปรแกรมหลังจากซิงค์เสร็จ
  }
}

syncDatabase();
