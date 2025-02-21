require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const sequelize = require("./config/database");
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
app.use(cors({
  origin: ["https://www.gusorn.com", "http://localhost:5173"], 
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true, // ✅ รองรับ Credentials
  preflightContinue: false, 
  optionsSuccessStatus: 204, // ✅ แก้ไขปัญหา Preflight Request (CORS)
}));
app.use((req, res, next) => {
  const openRoutes = ["/auth/login", "/auth/register"]; // ✅ API ที่ไม่ต้องใช้ Credentials
  if (openRoutes.includes(req.path)) {
    res.header("Access-Control-Allow-Origin", "*"); // ✅ อนุญาตทุก Origin เฉพาะ API ที่กำหนด
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type");
  }
  next();
});


app.use(express.json({ limit: "500mb" })); // ✅ กำหนด JSON Request Body สูงสุด 50MB
app.use(express.urlencoded({ extended: true, limit: "500mb" })); // ✅ รองรับ Form Data ขนาดใหญ่
app.use("/uploads", express.static(uploadDir)); // ✅ รองรับ Static File

// ✅ Routes
app.use("/users", userRoutes);
app.use("/auth", authRoutes);
app.use("/tutor", tutorRoutes);
app.use("/subscription", subscriptionRoutes);
app.use("/website", websiteRoutes);

app.get("/", (req, res) => {
  res.redirect("https://www.gusorn.com"); // เปลี่ยน URL ปลายทาง
});

// ✅ ฟังก์ชันซิงค์ฐานข้อมูล
async function syncDatabase() {
  try {
    await sequelize.sync({ force: false }); // ✅ ไม่ลบข้อมูลเดิม
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
