const express = require("express");
const {  servePaymentProofs } = require("../controllers/paymentController");
const { authenticateUser } = require("../middlewares/authMiddleware");
const { uploadPaymentProof } = require("../middlewares/uploadMiddleware"); // ✅ ใช้ middleware ใหม่

const router = express.Router();

// ✅ API: อัปโหลดหลักฐานการชำระเงินไปที่ `/uploads/payment_proofs`
router.post("/payment-proof", authenticateUser, uploadPaymentProof.single("proof"), servePaymentProofs);

// ✅ ให้ Express ให้บริการไฟล์อัปโหลดแบบ Static
router.use("/uploads/payment_proofs", express.static("uploads/payment_proofs"));

module.exports = router;
