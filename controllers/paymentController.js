const { PaymentProof } = require("../models");
const path = require("path");
const fs = require("fs");

// ✅ ตรวจสอบโฟลเดอร์อัปโหลด
const uploadDir = path.join(__dirname, "../uploads/payment_proofs");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ✅ Controller: อัปโหลดหลักฐานการชำระเงิน
exports.uploadPaymentProof = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "❌ กรุณาอัปโหลดไฟล์" });
  }

  const { packageId, paymentMethod } = req.body;
  const proofUrl = `/uploads/payment_proofs/${req.file.filename}`;

  // ✅ บันทึกข้อมูลลงฐานข้อมูล
  PaymentProof.create({
    userId: req.user.userId,
    packageId,
    paymentMethod,
    proofUrl,
    status: "pending",
  })
    .then((paymentProof) => {
      res.json({
        success: true,
        message: "✅ อัปโหลดหลักฐานการชำระเงินเรียบร้อย!",
        data: paymentProof,
      });
    })
    .catch((error) => {
      console.error("❌ Error uploading payment proof:", error);
      res.status(500).json({ success: false, message: "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง" });
    });
};

// ✅ ให้ Express ให้บริการไฟล์อัปโหลดแบบ Static
exports.servePaymentProofs = (req, res, next) => {
  express.static(uploadDir)(req, res, next);
};
