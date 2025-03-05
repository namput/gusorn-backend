const path = require("path");
const fs = require("fs");
const express = require("express");
const PaymentProof = require("../models/PaymentProof");
const Subscription = require("../models/Subscription");
const { sendNewSubscriptionEmail, sendSubscriptionConfirmationEmail, sendApprovalNotificationEmail, sendRejectionNotificationEmail } = require("../utils/emailService");
const User = require("../models/User");
const Referral = require("../models/Referral");

// ✅ ตรวจสอบโฟลเดอร์อัปโหลด
const uploadDir = path.join(__dirname, "../uploads/payment_proofs");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ✅ Controller: อัปโหลดหลักฐานการชำระเงิน
exports.uploadPaymentProof = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "❌ กรุณาอัปโหลดไฟล์" });
    }

    const { packageId, paymentMethod, amount } = req.body;

    // ✅ ตรวจสอบว่าค่าที่ต้องการมีครบหรือไม่
    if (!packageId || !paymentMethod || !amount) {
      return res.status(400).json({
        success: false,
        message: "❌ ข้อมูลไม่ครบ กรุณาระบุ packageId, paymentMethod และ amount",
      });
    }

    const proofUrl = `/uploads/payment_proofs/${req.file.filename}`;

    // ✅ ตรวจสอบว่า req.user มีข้อมูลหรือไม่
    if (!req.user || !req.user.userId || !req.user.email) {
      return res.status(401).json({
        success: false,
        message: "❌ ไม่ได้รับข้อมูลผู้ใช้ กรุณาเข้าสู่ระบบใหม่",
      });
    }

    // ✅ บันทึกข้อมูลลงฐานข้อมูล
    const newProof = await PaymentProof.create({
      userId: req.user.userId,
      packageId,
      paymentMethod,
      amount: parseFloat(amount), // ✅ แปลง `amount` เป็นตัวเลขก่อนบันทึก
      proofUrl,
      status: "pending",
    });

    console.log("✅ Payment proof uploaded by:", req.user);

    // ✅ ส่งอีเมลแจ้งเตือน
    await sendNewSubscriptionEmail(packageId, req.user.email);
    await sendSubscriptionConfirmationEmail(packageId, req.user.email);

    res.json({
      success: true,
      message: "✅ อัปโหลดหลักฐานการชำระเงินเรียบร้อย!",
      data: newProof,
    });
  } catch (error) {
    console.error("❌ Error uploading payment proof:", error);
    res
      .status(500)
      .json({ success: false, message: "❌ เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง" });
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
    res
      .status(500)
      .json({ success: false, message: "เกิดข้อผิดพลาด กรุณาลองใหม่" });
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
    res
      .status(500)
      .json({ success: false, message: "เกิดข้อผิดพลาดในการโหลดข้อมูล" });
  }
};

// ✅ อนุมัติการชำระเงิน & สร้าง Subscription
exports.approvePayment = async (req, res) => {
  try {
    const { id } = req.params; // ✅ อ้างอิงหมายเลขรายการชำระเงิน
    const payment = await PaymentProof.findByPk(id);

    if (!payment) {
      return res
        .status(404)
        .json({ success: false, message: "❌ ไม่พบหลักฐานการชำระเงิน" });
    }

    // ✅ ตรวจสอบว่าผู้ใช้มี Subscription ที่ใช้งานอยู่หรือไม่
    const existingSubscription = await Subscription.findOne({
      where: { userId: payment.userId, status: "active" },
    });

    if (existingSubscription) {
      return res.status(400).json({
        success: false,
        message: "❌ ผู้ใช้มี Subscription ที่ยังใช้งานได้อยู่แล้ว",
      });
    }

    // ✅ อัปเดตสถานะการชำระเงินเป็น "approved"
    payment.status = "approved";
    await payment.save();

    // ✅ ตรวจสอบแพ็กเกจที่สมัคร
    const packagePrices = {
      basic: 99,
      standard: 199,
      premium: 299,
      business: 399,
    };

    const price = packagePrices[payment.packageId] || 0;
    const paymentMethod = payment.paymentMethod || "unknown";

    // ✅ สร้าง Subscription ใหม่
    const newSubscription = await Subscription.create({
      userId: payment.userId,
      packageType: payment.packageId,
      price: price,
      paymentMethod: paymentMethod,
      startDate: new Date(),
      status: "active",
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      paymentId: payment.id,
    });

    // ✅ ค้นหาข้อมูลผู้ใช้
    const user = await User.findByPk(payment.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "❌ ไม่พบผู้ใช้" });
    }

    // ✅ ตรวจสอบว่าผู้ใช้มี "Referrer" หรือไม่ (มีคนแนะนำหรือเปล่า)
    if (user.referrerId) {
      const referrer = await User.findByPk(user.referrerId);
      if (referrer) {
        const commission = price * 0.5; // ✅ คำนวณค่าคอมฯ 50%

        // ✅ ตรวจสอบว่าเคยจ่ายค่าคอมฯ ให้คนนี้แล้วหรือยัง
        const existingReferral = await Referral.findOne({
          where: { referredUserId: user.id },
        });

        if (!existingReferral) {
          // ✅ บันทึกค่าคอมมิชชั่น
          await Referral.create({
            referrerId: referrer.id,
            referredUserId: user.id,
            commission: commission,
            status: "paid",
          });

          console.log(`✅ จ่ายค่าคอมฯ ${commission} บาท ให้ ${referrer.username}`);
        }
      }
    }

    // ✅ ส่งอีเมลแจ้งเตือนอนุมัติแพ็กเกจ
    await sendApprovalNotificationEmail(user, newSubscription);

    res.json({ success: true, message: "✅ อนุมัติแพ็กเกจสำเร็จ!" });
  } catch (error) {
    console.error("❌ Error approving payment:", error);
    res.status(500).json({
      success: false,
      message: "❌ เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง",
    });
  }
};


// ❌ ปฏิเสธการชำระเงิน
exports.rejectPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const payment = await PaymentProof.findByPk(id);

    if (!payment) {
      return res
        .status(404)
        .json({ success: false, message: "ไม่พบหลักฐานการชำระเงิน" });
    }
    const user = await User.findOne({ where: { id:payment.userId },order: [["createdAt", "DESC"]], });
    await sendRejectionNotificationEmail( user, payment)
    // ❌ อัปเดตสถานะเป็น "rejected"
    payment.status = "rejected";
    await payment.save();

    res.json({
      success: true,
      message: "❌ ปฏิเสธแพ็กเกจสำเร็จ! กรุณาอัปโหลดใหม่",
    });
  } catch (error) {
    console.error("❌ Error rejecting payment:", error);
    res
      .status(500)
      .json({ success: false, message: "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง" });
  }
};

// ✅ ให้ Express ให้บริการไฟล์อัปโหลดแบบ Static
exports.servePaymentProofs = express.static(uploadDir);
