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
const forumRoutes = require("./routes/forumRoutes"); // ✅ Import Forum Routes

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
const allowedOrigins = ["https://www.gusorn.com", "http://localhost:5173", "https://apigusorn.neuatech.com", "www.gusorn.com", "gusorn.com", "http://www.gusorn.com"];

app.use((req, res, next) => {
  const origin = req.headers.origin || "";

  // ✅ Public API ที่อนุญาตทุกที่ (`*` แต่ต้องไม่มี `credentials: "include"`)
  const globalPublicRoutes = [
    "/auth/verify-email",
    "/auth/check-verification",
    "/uploads/payment_proofs",
  ];

  // ✅ API ที่เปิดให้ทุกที่ แต่ต้องไม่ใช้ `credentials: "include"`
  const forumPublicRoutes = [
    "/forum/threads", // ✅ อ่านกระทู้ทั้งหมด
    "/forum/threads/", // ✅ อ่านรายละเอียดกระทู้
  ];

  // ✅ API ที่ต้องใช้ `allowedOrigins` แต่ไม่ต้องใช้ Token (Login/Register)
  const authRoutes = ["/auth/login", "/auth/register"];

  // ✅ API ที่ต้องใช้ `allowedOrigins` และต้องมี Token (`Authorization`)
  const restrictedRoutes = ["/forum/threads"];

  // ✅ Public API ใช้ `*` แต่ต้องไม่มี `credentials: "include"`
  if (globalPublicRoutes.some(route => req.path.startsWith(route))) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  }
  // ✅ Forum API (GET) ต้องไม่ใช้ `*` แต่ต้องกำหนด `allowedOrigins` เพราะใช้ `credentials: "include"`
  else if (forumPublicRoutes.some(route => req.path.startsWith(route))) {
    if (allowedOrigins.includes(origin)) {
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
      res.setHeader("Access-Control-Allow-Credentials", "true"); // ✅ รองรับ Credentials
    } else {
      return res.status(403).json({ message: "Access Denied: Origin Not Allowed" });
    }
  }
  // ✅ Login/Register ต้องมาจาก Origin ที่กำหนด
  else if (authRoutes.some(route => req.path.startsWith(route)) && allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  }
  // ✅ API ที่ต้องใช้ Token และต้องมาจาก Origin ที่อนุญาต (POST /forum/threads)
  else if (restrictedRoutes.some(route => req.path.startsWith(route)) && allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Methods", "POST");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.setHeader("Access-Control-Allow-Credentials", "true"); // ✅ ต้องใช้ Credentials (Token)
  }
  // ✅ API อื่น ๆ ที่ต้องใช้ Token และต้องอยู่ใน `allowedOrigins`
  else if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.setHeader("Access-Control-Allow-Credentials", "true");
  } 
  // ❌ บล็อก Origin ที่ไม่ได้รับอนุญาต (ใช้ HTTP 403)
  else {
    return res.status(403).json({ message: "Access Denied: Origin Not Allowed" });
  }

  // ✅ ตอบกลับ OPTIONS Request (Preflight) ทันที
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});


// const allowedOrigins = ["https://www.gusorn.com", "http://localhost:5173"];

// app.use((req, res, next) => {
//   const origin = req.headers.origin;

//   // ✅ Public API ที่ต้องอนุญาตทุกที่ (เปิดจากอีเมล)
//   const globalPublicRoutes = [
//     "/auth/verify-email",
//     "/auth/check-verification",
//     "/uploads/payment_proofs",
//     "/forum/threads", // ✅ อนุญาตให้เข้าถึงกระทู้ทั้งหมด
//     "/forum/threads/", // ✅ รองรับ Dynamic Path (ดึงกระทู้ตาม ID)
//   ];

//   // ✅ อนุญาตจากทุก Origin เฉพาะ Global Public API
//   if (globalPublicRoutes.includes(req.path)) {
//     res.setHeader("Access-Control-Allow-Origin", "*");
//     res.setHeader("Access-Control-Allow-Methods", "GET, POST");
//     res.setHeader(
//       "Access-Control-Allow-Headers",
//       "Content-Type, Authorization"
//     );

//     // ✅ จำกัดเฉพาะ Origin ที่กำหนดสำหรับ API อื่นๆ
//   } else if (allowedOrigins.includes(origin)) {
//     res.setHeader("Access-Control-Allow-Origin", origin);
//     res.setHeader(
//       "Access-Control-Allow-Methods",
//       "GET, POST, PUT, DELETE, OPTIONS"
//     );
//     res.setHeader(
//       "Access-Control-Allow-Headers",
//       "Content-Type, Authorization"
//     );

//     // 🔒 Private API ต้องใช้ Credentials (Token)
//     res.setHeader("Access-Control-Allow-Credentials", "true");
//   } else {
//     // ❌ บล็อก Origin ที่ไม่ได้รับอนุญาต
//     return res.redirect("https://www.gusorn.com");
//   }

//   if (req.method === "OPTIONS") {
//     return res.sendStatus(204);
//   }

//   next();
// });

// ✅ Routes
app.use("/users", userRoutes);
app.use("/auth", authRoutes);
app.use("/tutor", tutorRoutes);
app.use("/subscription", subscriptionRoutes);
app.use("/website", websiteRoutes);
app.use("/payment", paymentRoutes);
app.use("/forum", forumRoutes); // ✅ เพิ่ม Forum API

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
