
const User = require("../models/User");
const Payment = require("../models/Payment");
const PaymentProof = require("../models/PaymentProof");
const Referral = require("../models/Referral");


// ✅ ดึงค่าคอมมิชชั่นที่ยังไม่ได้จ่าย
exports.getPendingCommissions = async (req, res) => {
  try {
    const pendingCommissions = await Referral.findAll({
      where: { status: "pending" }, // ✅ ดึงเฉพาะค่าคอมฯ ที่ยังไม่ได้จ่าย
      include: [
        {
          model: User,
          as: "referrer",
          attributes: ["id", "username", "email"], // ✅ ข้อมูลของผู้แนะนำ
        },
        {
          model: User,
          as: "referredUser",
          attributes: ["id", "username", "email"], // ✅ ข้อมูลของผู้ถูกเชิญ
        },
      ],
    });

    res.status(200).json({ success: true, data: pendingCommissions });
  } catch (error) {
    console.error("❌ Error fetching commissions:", error);
    res.status(500).json({
      success: false,
      message: "❌ ไม่สามารถดึงข้อมูลค่าคอมมิชชั่นได้",
    });
  }
};

// ✅ จ่ายค่าคอมมิชชั่นให้ผู้แนะนำ
exports.payCommission = async (req, res) => {
  try {
    const { referralId } = req.body;

    // ✅ ค้นหาข้อมูลค่าคอมมิชชั่นที่ต้องจ่าย
    const referral = await Referral.findByPk(referralId, {
      include: [{ model: User, as: "referrer" }], // ✅ ดึงข้อมูลผู้แนะนำ
    });

    if (!referral || referral.status !== "pending") {
      return res.status(400).json({ message: "❌ ค่าคอมมิชชั่นไม่ถูกต้อง หรือถูกจ่ายไปแล้ว" });
    }

    // ✅ ค้นหาหลักฐานการชำระเงินล่าสุดของผู้ใช้
    const paymentProof = await PaymentProof.findOne({
      where: { userId: referral.referredUserId, status: "approved" },
      order: [["createdAt", "DESC"]],
    });

    if (!paymentProof) {
      return res.status(400).json({ message: "❌ ไม่พบหลักฐานการชำระเงินที่อนุมัติ" });
    }

    // ✅ คำนวณค่าคอมมิชชั่นจากยอดชำระจริง
    const commissionAmount = paymentProof.amount * 0.5;

    // ✅ สร้างธุรกรรมการจ่ายค่าคอมมิชชั่นลงใน `Payment`
    await Payment.create({
      referrerId: referral.referrerId,
      referredUserId: referral.referredUserId,
      amount: commissionAmount,
      status: "completed",
      paidAt: new Date(),
    });

    // ✅ อัปเดตสถานะค่าคอมมิชชั่นเป็น "paid"
    await referral.update({
      status: "paid",
      commission: commissionAmount,
    });

    res.status(200).json({
      success: true,
      message: `✅ จ่ายค่าคอมมิชชั่น ${commissionAmount} บาท สำเร็จ!`,
    });
  } catch (error) {
    console.error("❌ Error paying commission:", error);
    res.status(500).json({
      success: false,
      message: "❌ ไม่สามารถจ่ายค่าคอมมิชชั่นได้",
    });
  }
};
