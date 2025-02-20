require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");

const sequelize = require("./config/database");
const User = require("./models/User");
const TutorProfile = require("./models/TutorProfile");
const Subscription = require("./models/Subscription");
const Website = require("./models/Website");

const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const tutorRoutes = require("./routes/tutorRoutes");
const subscriptionRoutes = require("./routes/subscriptionRoutes");
const websiteRoutes = require("./routes/websiteRoutes");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ✅ Static file serving
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ Routes
app.use("/users", userRoutes);
app.use("/auth", authRoutes);
app.use("/tutor", tutorRoutes);
app.use("/subscription", subscriptionRoutes);
app.use("/website", websiteRoutes);
app.get("/", (req, res) => {
  res.redirect("https://www.gusorn.com"); // เปลี่ยน URL ปลายทางที่ต้องการ
});

// ✅ ฟังก์ชันซิงค์ฐานข้อมูล
async function syncDatabase() {
  try {
    await sequelize.sync({ alter: true });
    console.log("✅ ซิงค์ฐานข้อมูลสำเร็จ!");
  } catch (error) {
    console.error("❌ เกิดข้อผิดพลาดในการซิงค์ฐานข้อมูล:", error);
  }
}

// ✅ เริ่มเซิร์ฟเวอร์
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  try {
    await sequelize.authenticate();
    console.log(`✅ Server running on port ${PORT}`);
    
    // 🔥 ซิงค์ฐานข้อมูลหลังจากเชื่อมต่อสำเร็จ
    await syncDatabase();
  } catch (error) {
    console.error("❌ Database connection failed:", error);
  }
});
