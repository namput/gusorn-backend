const path = require("path");
const fs = require("fs");
const express = require("express");
const PaymentProof = require("../models/PaymentProof");

// ✅ ตรวจสอบโฟลเดอร์อัปโหลด
const uploadDir = path.join(__dirname, "../uploads/payment_proofs");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ✅ Controller: อัปโหลดหลักฐานการชำระเงิน
exports.uploadPaymentProof = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "❌ กรุณาอัปโหลดไฟล์" });
    }

    const { packageId, paymentMethod } = req.body;
    const proofUrl = `/uploads/payment_proofs/${req.file.filename}`;

    // ✅ บันทึกข้อมูลลงฐานข้อมูล
    const newProof = await PaymentProof.create({
      userId: req.user.userId,
      packageId,
      paymentMethod,
      proofUrl,
      status: "pending",
    });

    res.json({
      success: true,
      message: "✅ อัปโหลดหลักฐานการชำระเงินเรียบร้อย!",
      data: newProof,
    });
  } catch (error) {
    console.error("❌ Error uploading payment proof:", error);
    res.status(500).json({ success: false, message: "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง" });
  }
};

// ✅ แก้ไข servePaymentProofs ให้เป็น middleware ที่สามารถใช้กับ router.use()
exports.servePaymentProofs = express.static(uploadDir);
