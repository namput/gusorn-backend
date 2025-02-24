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
    const userId = req.user.userId;

    // ✅ ดึงข้อมูลล่าสุดของหลักฐานการชำระเงิน
    const payment = await PaymentProof.findOne({
      where: { userId },
      order: [["createdAt", "DESC"]],
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "❌ ไม่พบข้อมูลการชำระเงิน",
      });
    }

    res.json({
      success: true,
      status: payment.status,
      proofUrl: payment.proofUrl,
    });

  } catch (error) {
    console.error("❌ Error checking payment status:", error);
    res.status(500).json({ success: false, message: "เกิดข้อผิดพลาด กรุณาลองใหม่" });
  }
};

// ✅ ดึงรายการที่รออนุมัติ
exports.getPendingPayments = async (req, res) => {
  try {
    const pendingPayments = await PaymentProof.findAll({
      where: { status: "pending" },
    });

    res.json({ success: true, data: pendingPayments });
  } catch (error) {
    console.error("❌ Error fetching pending payments:", error);
    res.status(500).json({ success: false, message: "เกิดข้อผิดพลาดในการโหลดข้อมูล" });
  }
};


// ✅ อนุมัติการชำระเงิน & สร้าง Subscription
exports.approvePayment = async (req, res) => {
  try {
    const { id } = req.params; // ✅ อ้างอิงหมายเลขรายการชำระเงิน
    const payment = await PaymentProof.findByPk(id);

    if (!payment) {
      return res.status(404).json({ success: false, message: "❌ ไม่พบหลักฐานการชำระเงิน" });
    }

    // ✅ ตรวจสอบว่าผู้ใช้มี Subscription ที่ใช้งานอยู่หรือไม่
    const existingSubscription = await Subscription.findOne({
      where: { userId: payment.userId, status: "active" },
    });

    if (existingSubscription) {
      return res.status(400).json({ success: false, message: "❌ ผู้ใช้มี Subscription ที่ยังใช้งานได้อยู่แล้ว" });
    }

    // ✅ อัปเดตสถานะการชำระเงินเป็น "approved"
    payment.status = "approved";
    await payment.save();

    // ✅ ตรวจสอบให้แน่ใจว่ามี `price` และ `paymentMethod`
    const packagePrices = {
      basic: 99,
      standard: 199,
      premium: 299,
      business: 399,
    };

    const price = packagePrices[payment.packageId] || 0; // ❗ ถ้าไม่มี ให้เป็น 0
    const paymentMethod = payment.paymentMethod || "unknown"; // ❗ ถ้าไม่มี ให้ใช้ค่า "unknown"

    // ✅ สร้าง Subscription ใหม่
    const newSubscription = await Subscription.create({
      userId: payment.userId,
      packageType: payment.packageId,
      price: price, // 💰 กำหนดราคาแพ็กเกจ
      paymentMethod: paymentMethod, // 💳 วิธีการชำระเงิน (QR, Credit Card ฯลฯ)
      startDate:new Date(Date.now()),
      status: "active",
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // ⏳ 30 วันนับจากวันที่สมัคร
      paymentId: payment.id, // 🔗 อ้างอิงถึงหมายเลขรายการชำระเงิน
    });

    console.log("✅ Subscription Created:", newSubscription);

    res.json({ success: true, message: "✅ อนุมัติแพ็กเกจสำเร็จ!" });

  } catch (error) {
    console.error("❌ Error approving payment:", error);
    res.status(500).json({ success: false, message: "❌ เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง" });
  }
};



// ❌ ปฏิเสธการชำระเงิน
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

    res.json({ success: true, message: "❌ ปฏิเสธแพ็กเกจสำเร็จ! กรุณาอัปโหลดใหม่" });
  } catch (error) {
    console.error("❌ Error rejecting payment:", error);
    res.status(500).json({ success: false, message: "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง" });
  }
};

// ✅ ให้ Express ให้บริการไฟล์อัปโหลดแบบ Static
exports.servePaymentProofs = express.static(uploadDir);
