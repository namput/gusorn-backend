const express = require("express");
const { createProfile, getTutorProfile } = require("../controllers/tutorController");
const { authenticateUser } = require("../middlewares/authMiddleware");
const {upload} = require("../middlewares/uploadMiddleware");

const router = express.Router();

// ✅ รองรับอัปโหลดรูปและวิดีโอแยกโฟลเดอร์
router.post(
  "/create-profile",
  authenticateUser,
  upload.fields([{ name: "profileImage", maxCount: 1 }, { name: "introVideo", maxCount: 1 }]),
  (req, res, next) => {
    if (req.fileValidationError) {
      return res.status(400).json({ success: false, message: req.fileValidationError });
    }
    next();
  },
  createProfile
);
router.get("/profile", authenticateUser, getTutorProfile);

module.exports = router;
