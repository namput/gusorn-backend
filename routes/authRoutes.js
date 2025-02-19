
const express = require("express");
const { register, login } = require("../controllers/authController");
const { sendVerificationEmail, verifyEmail } = require("../controllers/authController");
const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/send-verification", sendVerificationEmail);
router.get("/verify-email", verifyEmail);

module.exports = router;
