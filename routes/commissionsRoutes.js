const express = require("express");
const {
  getPendingCommissions,
  payCommission,
} = require("../controllers/commissionController");

const { authenticateAdmin, authenticateUser } = require("../middlewares/authMiddleware");

const router = express.Router();

// ✅ API: ดึงค่าคอมมิชชั่นที่ยังไม่ได้จ่าย (สำหรับแอดมิน)
router.get("/pending",authenticateUser, authenticateAdmin, getPendingCommissions);

// ✅ API: จ่ายค่าคอมมิชชั่น (สำหรับแอดมิน)
router.post("/pay",authenticateUser, authenticateAdmin, payCommission);

module.exports = router;
