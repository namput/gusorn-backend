const express = require("express");
const { register, login, verifyEmail, checkVerification } = require("../controllers/authController");
const { sendVerificationEmail } = require("../utils/emailService");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/send-verification", sendVerificationEmail);
router.get("/verify-email", verifyEmail);
router.get("/check-verification", checkVerification);

module.exports = router;
