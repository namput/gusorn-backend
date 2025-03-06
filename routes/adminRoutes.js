const express = require("express");
const { getAllUsers, updateUserRole } = require("../controllers/adminController");
const { authenticateUser, authenticateAdmin } = require("../middlewares/authMiddleware");

const router = express.Router();

// ✅ API: ดึงข้อมูลสมาชิกทั้งหมด (เฉพาะแอดมิน)
router.get("/users", authenticateUser, authenticateAdmin, getAllUsers);

// ✅ API: อัปเดตสิทธิ์ของผู้ใช้ (เปลี่ยนจาก user ↔ admin) (เฉพาะแอดมิน)
router.post("/users/:userId/role", authenticateUser, authenticateAdmin, updateUserRole);

module.exports = router;
