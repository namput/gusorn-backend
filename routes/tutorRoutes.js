const express = require("express");
const { createProfile } = require("../controllers/tutorController");
const { authenticateUser } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadMiddleware"); // ✅ ใช้ Middleware ที่ถูกต้อง

const router = express.Router();

// ✅ เส้นทาง API รองรับอัปโหลดไฟล์ (รูปโปรไฟล์ & วิดีโอแนะนำตัว)
router.post("/create-profile", authenticateUser, upload.fields([{ name: "profileImage" }, { name: "introVideo" }]), createProfile);

module.exports = router;
