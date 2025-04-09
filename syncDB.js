const sequelize = require("./config/database");
const User = require("./models/User");
const TutorProfile = require("./models/TutorProfile");
const Subscription = require("./models/Subscription");
const Website = require("./models/Website");
const PaymentProof = require("./models/PaymentProof");
const Referral = require("./models/Referral");
const Payment = require("./models/Payment");
const Templates = require("./models/Templates");
const Package = require("./models/Package");
// ✅ Import Forum Models และตั้งค่าความสัมพันธ์
const { Thread, Reply } = require("./models");

async function syncDatabase() {
  try {
    console.log("🔄 กำลังซิงค์ฐานข้อมูล...");

    // ✅ ซิงค์ฐานข้อมูลทั้งหมดหลังจากตั้งค่าความสัมพันธ์
    await sequelize.sync({ alter: true });

    console.log("✅ ซิงค์ฐานข้อมูลสำเร็จ!");
  } catch (error) {
    console.error("❌ เกิดข้อผิดพลาดในการซิงค์ฐานข้อมูล:", error);
  } finally {
    await sequelize.close(); // ✅ ปิด Connection หลังจากซิงค์เสร็จ
  }
}

syncDatabase();
