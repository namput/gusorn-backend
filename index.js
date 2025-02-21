require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const morgan = require("morgan"); // ✅ Log Requests
const sequelize = require("./config/database");

// ✅ Import Routes
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const tutorRoutes = require("./routes/tutorRoutes");
const subscriptionRoutes = require("./routes/subscriptionRoutes");
const websiteRoutes = require("./routes/websiteRoutes");

const app = express();

// ✅ ตรวจสอบและสร้างโฟลเดอร์ `uploads/` อัตโนมัติ
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ✅ Middleware
app.use(morgan("dev")); // ✅ Log HTTP Requests
app.use(express.json({ limit: "500mb" })); // ✅ รองรับ JSON Request Body ใหญ่สุด 500MB
app.use(express.urlencoded({ extended: true, limit: "500mb" })); // ✅ รองรับ Form Data ขนาดใหญ่
app.use("/uploads", express.static(uploadDir)); // ✅ เสิร์ฟไฟล์ที่อัปโหลด

// ✅ Dynamic CORS Configuration
const allowedOrigins = ["https://www.gusorn.com", "http://localhost:5173"];
const openRoutes = ["/auth/login", "/auth/register", "/auth/check-verification"];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (openRoutes.includes(req.path)) {
    res.setHeader("Access-Control-Allow-Origin", "*"); // ✅ เฉพาะ API ที่กำหนด
  }

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});

// ✅ Routes
app.use("/users", userRoutes);
app.use("/auth", authRoutes);
app.use("/tutor", tutorRoutes);
app.use("/subscription", subscriptionRoutes);
app.use("/website", websiteRoutes);

app.get("/", (req, res) => {
  res.redirect("https://www.gusorn.com");
});
app.get("/health", (req, res) => {
  res.json({ status: "running" });
});

// ✅ ฟังก์ชันซิงค์ฐานข้อมูล (ไม่ลบข้อมูลเดิม)


// ✅ เริ่มเซิร์ฟเวอร์
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  try {
    await sequelize.authenticate();
    console.log(`✅ Server running on port ${PORT}`);


  } catch (error) {
    console.error("❌ Database connection failed:", error);
  }
});
