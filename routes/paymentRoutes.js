const express = require("express");
const { 
  uploadPaymentProof, 
  checkPaymentStatus, 
  approvePayment, 
  rejectPayment, 
  getPendingPayments 
} = require("../controllers/paymentController");

const { authenticateUser, authenticateAdmin } = require("../middlewares/authMiddleware");
const { uploadPaymentProof: upload } = require("../middlewares/uploadMiddleware");

const router = express.Router();

// ✅ API: อัปโหลดหลักฐานการชำระเงินไปที่ `/uploads/payment_proofs`
router.post("/payment-proof", authenticateUser, upload.single("proof"), uploadPaymentProof);

// ✅ API: ตรวจสอบสถานะการชำระเงิน
router.get("/payment-status", authenticateUser, checkPaymentStatus);

// ✅ API: ดึงรายการที่รออนุมัติ (เฉพาะ Admin เท่านั้น)
router.get("/pending-list", authenticateAdmin, getPendingPayments);

// ✅ API: อนุมัติการชำระเงิน (ใช้ PUT)
router.put("/approve/:id", authenticateAdmin, approvePayment);

// ✅ API: ปฏิเสธการชำระเงิน (ใช้ PUT)
router.put("/reject/:id", authenticateAdmin, rejectPayment);

// ✅ ให้ Express ให้บริการไฟล์อัปโหลดแบบ Static
router.use("/uploads/payment_proofs", express.static("uploads/payment_proofs"));

module.exports = router;
