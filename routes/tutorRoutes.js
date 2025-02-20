const express = require("express");
const { getTutorProfile, updateTutorProfile, createTutorProfile, createProfile, uploadTutorPhoto } = require("../controllers/tutorController");
const { authenticateUser } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadMiddleware"); // ✅ ใช้ Middleware ที่ถูกต้อง

const router = express.Router();

// ✅ เส้นทาง API สำหรับสร้างโปรไฟล์ติวเตอร์
router.post("/create", authenticateUser, createTutorProfile);
router.get("/profile", authenticateUser, getTutorProfile);
router.put("/profile/update", authenticateUser, updateTutorProfile);
router.put("/upload-photo", authenticateUser, upload.single("photo"), uploadTutorPhoto);

// ✅ เส้นทาง API รองรับอัปโหลดไฟล์ (รูปโปรไฟล์ & วิดีโอแนะนำตัว)
router.post("/create-profile", authenticateUser, upload.fields([{ name: "profileImage" }, { name: "introVideo" }]), createProfile);

module.exports = router;
