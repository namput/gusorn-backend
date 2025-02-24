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
const paymentRoutes = require("./routes/paymentRoutes");


const app = express();


// ✅ ตรวจสอบและสร้างโฟลเดอร์ `uploads/`
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ✅ Middleware
app.use(morgan("dev"));
app.use(express.json({ limit: "1030mb" }));
app.use(express.urlencoded({ extended: true, limit: "1030mb" }));
app.use("/uploads", express.static(uploadDir));



const allowedOrigins = ["https://www.gusorn.com", "http://localhost:5173"];

app.use((req, res, next) => {
  const origin = req.headers.origin;

  // ✅ Public API ที่ต้องอนุญาตทุกที่ (เปิดจากอีเมล)
  const globalPublicRoutes = ["/auth/verify-email", "/auth/check-verification","/uploads/payment_proofs"];

  // ✅ อนุญาตจากทุก Origin เฉพาะ Global Public API
  if (globalPublicRoutes.includes(req.path)) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // ✅ จำกัดเฉพาะ Origin ที่กำหนดสำหรับ API อื่นๆ
  } else if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

    // 🔒 Private API ต้องใช้ Credentials (Token)
      res.setHeader("Access-Control-Allow-Credentials", "true");

  } else {
    // ❌ บล็อก Origin ที่ไม่ได้รับอนุญาต
    return res.redirect("https://www.gusorn.com");
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
app.use("/payment", paymentRoutes);

app.get("/", (req, res) => {
  res.redirect("https://www.gusorn.com");
});
app.get("/health", (req, res) => {
  res.json({ status: "running" });
});

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
