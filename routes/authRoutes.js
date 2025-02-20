const express = require("express");
const {
  register,
  login,
  checkVerification,
  sendVerificationEmail,
  verifyEmail,
} = require("../controllers/authController");
const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/send-verification", sendVerificationEmail);
router.get("/verify-email", verifyEmail);
router.get("/check-verification", checkVerification);

module.exports = router;
