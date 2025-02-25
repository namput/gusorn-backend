const express = require("express");

const { authenticateUser } = require("../middlewares/authMiddleware");
const { getAllThreads, getThreadById, createThread, addReply } = require("../controllers/forumController");

const router = express.Router();

// ✅ API: ดึงกระทู้ทั้งหมด
router.get("/threads", getAllThreads);

// ✅ API: ดึงกระทู้ตาม ID
router.get("/threads/:id", getThreadById);

// ✅ API: ตั้งกระทู้ใหม่ (ต้องล็อกอิน)
router.post("/threads", authenticateUser, createThread);

// ✅ API: เพิ่มความคิดเห็น (ต้องล็อกอิน)
router.post("/replies", authenticateUser, addReply);

module.exports = router;
