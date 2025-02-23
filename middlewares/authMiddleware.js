
const jwt = require("jsonwebtoken");

exports.authenticateUser = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // ตรวจสอบว่ามี Token หรือไม่
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "ไม่พบ Token หรือไม่ได้รับอนุญาต" });
  }

  // ดึง Token จาก Header
  const token = authHeader.split(" ")[1];

  try {
    // ตรวจสอบและถอดรหัส Token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // แนบข้อมูลผู้ใช้ไปยัง req.user
    req.user = decoded;

    next(); // ไปยัง Middleware หรือ Controller ถัดไป
  } catch (error) {
    return res.status(403).json({ message: "Token ไม่ถูกต้อง" });
  }
};
// ✅ ตรวจสอบสิทธิ์ Admin
exports.authenticateAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "❌ Unauthorized: ไม่มีข้อมูลผู้ใช้" });
    }

    // ✅ ดึงข้อมูลผู้ใช้จากฐานข้อมูล
    const user = await User.findByPk(req.user.userId);

    if (!user) {
      return res.status(404).json({ success: false, message: "❌ ไม่พบผู้ใช้" });
    }

    if (user.role !== "admin") {
      return res.status(403).json({ success: false, message: "⛔ คุณไม่มีสิทธิ์เข้าถึงหน้านี้ (Admin Only)" });
    }

    next(); // ✅ ผ่านการตรวจสอบ
  } catch (error) {
    console.error("❌ Error in authenticateAdmin:", error);
    res.status(500).json({ success: false, message: "เกิดข้อผิดพลาด กรุณาลองใหม่" });
  }
};