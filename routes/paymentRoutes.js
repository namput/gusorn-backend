const express = require("express");
const path = require("path"); // ✅ Import path ที่หายไป
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
router.get("/payment-status", authenticateUser, checkPaymentStatus);
router.get("/pending-list", authenticateUser, authenticateAdmin, getPendingPayments);
router.post("/approve/:id", authenticateUser, authenticateAdmin, approvePayment);
router.post("/reject/:id", authenticateUser, authenticateAdmin, rejectPayment);
// ✅ ให้ Express ให้บริการไฟล์อัปโหลดแบบ Static
router.use("/uploads/payment_proofs", express.static(path.join(__dirname, "../uploads/payment_proofs")));


module.exports = router;
