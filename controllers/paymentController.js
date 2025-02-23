const path = require("path");
const fs = require("fs");
const express = require("express");
const PaymentProof = require("../models/PaymentProof");
const Subscription = require("../models/Subscription");

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


// ✅ ตรวจสอบสถานะการชำระเงิน
exports.checkPaymentStatus = async (req, res) => {
  try {
    const userId = req.user.userId; // 🔐 ดึง ID ผู้ใช้ที่ล็อกอิน

    // ✅ ดึงข้อมูลล่าสุดของหลักฐานการชำระเงิน
    const payment = await PaymentProof.findOne({
      where: { userId },
      order: [["createdAt", "DESC"]], // เรียงจากล่าสุด
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "❌ ไม่พบข้อมูลการชำระเงิน",
      });
    }

    res.json({
      success: true,
      status: payment.status, // "pending", "approved", "rejected"
      proofUrl: payment.proofUrl, // URL หลักฐานการชำระเงิน
    });

  } catch (error) {
    console.error("❌ Error checking payment status:", error);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาด กรุณาลองใหม่",
    });
  }
};



exports.approvePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const payment = await PaymentProof.findByPk(id);

    if (!payment) {
      return res.status(404).json({ success: false, message: "ไม่พบหลักฐานการชำระเงิน" });
    }

    // ✅ อัปเดตสถานะเป็น "approved"
    payment.status = "approved";
    await payment.save();

    // ✅ สร้าง Subscription ให้ผู้ใช้
    await Subscription.create({
      userId: payment.userId,
      packageType: payment.packageId,
      status: "active",
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 วัน
    });

    res.json({ success: true, message: "✅ อนุมัติแพ็กเกจสำเร็จ!" });
  } catch (error) {
    console.error("❌ Error approving payment:", error);
    res.status(500).json({ success: false, message: "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง" });
  }
};

exports.rejectPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const payment = await PaymentProof.findByPk(id);

    if (!payment) {
      return res.status(404).json({ success: false, message: "ไม่พบหลักฐานการชำระเงิน" });
    }

    // ❌ อัปเดตสถานะเป็น "rejected"
    payment.status = "rejected";
    await payment.save();

    res.json({ success: true, message: "❌ ปฏิเสธแพ็กเกจสำเร็จ!" });
  } catch (error) {
    console.error("❌ Error rejecting payment:", error);
    res.status(500).json({ success: false, message: "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง" });
  }
};


// ✅ แก้ไข servePaymentProofs ให้เป็น middleware ที่สามารถใช้กับ router.use()
exports.servePaymentProofs = express.static(uploadDir);
