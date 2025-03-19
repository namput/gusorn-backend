const express = require("express");
const { register, login, verifyEmail, checkVerification, forgotPassword, resetPassword } = require("../controllers/authController");
const { sendVerificationEmail } = require("../utils/emailService");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/send-verification", sendVerificationEmail);
router.get("/verify-email", verifyEmail);
router.get("/check-verification", checkVerification);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword); // ✅ เส้นทางตั้งรหัสผ่านใหม่

module.exports = router;
