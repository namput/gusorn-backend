const express = require("express");
const { createProfile } = require("../controllers/tutorController");
const { authenticateUser } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadMiddleware");

const router = express.Router();

// ✅ รองรับการอัปโหลดรูป & วิดีโอ และตรวจสอบว่ามีโฟลเดอร์ `uploads/`
router.post(
  "/create-profile",
  authenticateUser,
  upload.fields([{ name: "profileImage" }, { name: "introVideo" }]),
  (req, res, next) => {
    if (req.fileValidationError) {
      return res.status(400).json({ success: false, message: req.fileValidationError });
    }
    next();
  },
  createProfile
);

module.exports = router;
