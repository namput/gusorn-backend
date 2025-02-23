const express = require("express");
const { uploadPaymentProof, servePaymentProofs, checkPaymentStatus } = require("../controllers/paymentController");
const { authenticateUser } = require("../middlewares/authMiddleware");
const { uploadPaymentProof: upload } = require("../middlewares/uploadMiddleware"); // ✅ ใช้ middleware ใหม่

const { approvePayment, rejectPayment, getPendingPayments } = require("../controllers/paymentController");
const { authenticateAdmin } = require("../middlewares/authMiddleware"); // ✅ ตรวจสอบสิทธิ์ Admin

const router = express.Router();

// ✅ API: อัปโหลดหลักฐานการชำระเงินไปที่ `/uploads/payment_proofs`
router.post("/payment-proof", authenticateUser, upload.single("proof"), uploadPaymentProof);
router.get("/payment-status", authenticateUser, checkPaymentStatus);
router.get("/pending-list", authenticateAdmin, getPendingPayments);
router.post("/approve/:id", authenticateAdmin, approvePayment);
router.post("/reject/:id", authenticateAdmin, rejectPayment);

// ✅ ให้ Express ให้บริการไฟล์อัปโหลดแบบ Static (servePaymentProofs ถูกต้องแล้ว)
router.use("/uploads/payment_proofs", servePaymentProofs);

module.exports = router;
