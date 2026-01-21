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
const demoRoutes = require("./routes/demoRoutes");
const commissionsRoutes = require("./routes/commissionsRoutes");
const adminRoutes = require("./routes/adminRoutes"); // ✅ Import Admin Routes
const templatesRoutes = require("./routes/templatesRoutes"); // ✅ Import Templates Routes
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
const allowedOrigins = ["https://www.gusorn.com","https://www.guson.co","https://www.guson.in.th","https://.guson.in.th", "http://localhost:5173", "https://apigusorn.neuatech.com", "www.gusorn.com", "gusorn.com", "https://www.gusorn.com", "www.guson.co", "guson.co", "https://guson.co","https://kyupikyupi.com/"];

app.use((req, res, next) => {
  const origin = req.headers.origin || "";

  // ✅ Public API ที่อนุญาตทุกที่ (`*` แต่ต้องไม่มี `credentials: "include"`)
  const globalPublicRoutes = [
    "/auth/verify-email",
    "/auth/check-verification",
    "/uploads/payment_proofs",
    "/uploads/profile_images",
    "/uploads/intro_videos",
    "/demo/tutor/data",
    "/reset-password"
  ];

  // ✅ API ที่เปิดให้ทุกที่ แต่ต้องไม่ใช้ `credentials: "include"`
  const forumPublicRoutes = [
    "/forum/threads", // ✅ อ่านกระทู้ทั้งหมด
    "/forum/threads/", // ✅ อ่านรายละเอียดกระทู้
  ];

  // ✅ API ที่ต้องใช้ `allowedOrigins` แต่ไม่ต้องใช้ Token (Login/Register)
  const openRoutes = ["/auth/login","/website/"];
  const isLocalhostSubdomain = /^http:\/\/.+\.localhost:5173$/.test(origin);
  const isProductionSubdomain = /^https:\/\/.+\.guson\.co$/.test(origin);
  const allowOrigin = isLocalhostSubdomain || isProductionSubdomain ? origin : null;
 
  // ✅ API ที่ต้องใช้ `allowedOrigins` และต้องมี Token (`Authorization`)
  const restrictedRoutes = ["/forum/threads","/forum/replies"];

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
  else if (openRoutes.some(route => req.path.startsWith(route)) && allowedOrigins.includes(origin)) {
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
  }  else if (allowOrigin) {
    res.setHeader("Access-Control-Allow-Origin", allowOrigin);
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

// ✅ Routes
app.use("/users", userRoutes);
app.use("/auth", authRoutes);
app.use("/tutor", tutorRoutes);
app.use("/subscription", subscriptionRoutes);
app.use("/website", websiteRoutes);
app.use("/payment", paymentRoutes);
app.use("/forum", forumRoutes); // ✅ เพิ่ม Forum API
app.use("/demo",demoRoutes);
app.use("/commissions", commissionsRoutes);
app.use("/admin", adminRoutes); // ✅ เชื่อม Route Admin
app.use("/templates", templatesRoutes); // ✅ เชื่อม Route Templates)


app.get("/", (req, res) => {
  res.redirect("https://kyupikyupi.com/");
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
