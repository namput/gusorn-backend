
const Subscription = require("../models/Subscription");

exports.getSubscriptionStatus = async (req, res) => {
  try {
    const userId = req.user.userId; // ดึง userId จาก JWT

    // ค้นหาสถานะการสมัครสมาชิกของผู้ใช้
    const subscription = await Subscription.findOne({
      where: { userId },
      order: [["expiresAt", "DESC"]], // เรียงลำดับจากวันหมดอายุล่าสุด
    });

    if (!subscription) {
      return res.status(404).json({ message: "ไม่มีข้อมูลการสมัครสมาชิก" });
    }

    // ตรวจสอบว่าสมาชิกหมดอายุหรือยัง
    const isExpired = new Date(subscription.expiresAt) < new Date();
    const status = isExpired ? "expired" : "active";

    res.status(200).json({
      message: "ดึงข้อมูลสถานะสมาชิกสำเร็จ",
      status,
      paymentMethod: subscription.paymentMethod,
      expiresAt: subscription.expiresAt,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};