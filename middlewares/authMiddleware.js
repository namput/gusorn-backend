const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ✅ ตรวจสอบว่าผู้ใช้มี Token และถอดรหัส Token
exports.authenticateUser = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "❌ ไม่พบ Token หรือไม่ได้รับอนุญาต" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // 🔥 เพิ่มข้อมูลผู้ใช้ลงใน req.user

    next(); // ไปยัง Middleware หรือ Controller ถัดไป
  } catch (error) {
    return res.status(403).json({ message: "❌ Token ไม่ถูกต้อง" });
  }
};

// ✅ ตรวจสอบสิทธิ์ Admin (ต้องเรียกใช้ `authenticateUser` ก่อน)
exports.authenticateAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "❌ Unauthorized: ไม่มีข้อมูลผู้ใช้" });
    }

    // ✅ ดึงข้อมูลผู้ใช้จากฐานข้อมูล
    const user = await User.findByPk(req.user.userId);

    if (!user) {
      console.log("❌ User not found in database");
      return res.status(404).json({ success: false, message: "❌ ไม่พบผู้ใช้" });
    }

    if (user.role !== "admin") {
      console.log("⛔ User is not admin:", user.role);
      return res.status(403).json({ success: false, message: "⛔ คุณไม่มีสิทธิ์เข้าถึงหน้านี้ (Admin Only)" });
    }

    console.log("✅ Admin Authentication Passed!");
    next();
  } catch (error) {
    console.error("❌ Error in authenticateAdmin:", error);
    res.status(500).json({ success: false, message: "เกิดข้อผิดพลาด กรุณาลองใหม่" });
  }
};
