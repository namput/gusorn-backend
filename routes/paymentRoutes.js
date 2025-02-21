const express = require("express");
const { uploadPaymentProof, servePaymentProofs } = require("../controllers/paymentController");
const { authenticateUser } = require("../middlewares/authMiddleware");
const { uploadImage } = require("../middlewares/fileUpload");

const router = express.Router();

// ✅ API: อัปโหลดหลักฐานการชำระเงิน (เฉพาะรูปภาพ)
router.post("/payment-proof", authenticateUser, uploadImage.single("proof"), uploadPaymentProof);

// ✅ ให้ Express ให้บริการไฟล์อัปโหลดแบบ Static
router.use("/uploads/payment_proofs", servePaymentProofs);

module.exports = router;
