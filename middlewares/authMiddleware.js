
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
