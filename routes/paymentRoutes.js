const express = require("express");
const { uploadPaymentProof, servePaymentProofs } = require("../controllers/paymentController");
const { authenticateUser } = require("../middlewares/authMiddleware");
const { uploadPaymentProof: upload } = require("../middlewares/uploadMiddleware"); // ✅ ใช้ middleware ใหม่

const router = express.Router();

// ✅ API: อัปโหลดหลักฐานการชำระเงินไปที่ `/uploads/payment_proofs`
router.post("/payment-proof", authenticateUser, upload.single("proof"), uploadPaymentProof);

// ✅ ให้ Express ให้บริการไฟล์อัปโหลดแบบ Static (servePaymentProofs ถูกต้องแล้ว)
router.use("/uploads/payment_proofs", servePaymentProofs);

module.exports = router;
