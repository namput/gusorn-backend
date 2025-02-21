const Subscription = require("../models/Subscription");
const User = require("../models/User");

// ✅ API: สมัครแพ็กเกจใหม่
exports.subscribePackage = async (req, res) => {
  try {
    const { packageType } = req.body;
    const userId = req.user.id;

    // ✅ ตรวจสอบว่าแพ็กเกจที่เลือกถูกต้องหรือไม่
    const validPackages = ["basic", "standard", "premium", "business"];
    if (!validPackages.includes(packageType)) {
      return res.status(400).json({ success: false, message: "❌ แพ็กเกจไม่ถูกต้อง" });
    }

    // ✅ ตรวจสอบว่าผู้ใช้มี Subscription อยู่แล้วหรือไม่
    let subscription = await Subscription.findOne({ where: { userId } });

    if (subscription) {
      // 🔄 ถ้ามีอยู่แล้ว และหมดอายุ → ต่ออายุ
      if (subscription.status === "expired") {
        subscription.packageType = packageType;
        subscription.status = "pending"; // ✅ รอการตรวจสอบ
        subscription.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        await subscription.save();
        return res.status(200).json({ success: true, subscription });
      } else {
        return res.status(400).json({ success: false, message: "❌ คุณมีแพ็กเกจอยู่แล้ว" });
      }
    }

    // ✅ ถ้ายังไม่มี Subscription → สร้างใหม่
    subscription = await Subscription.create({
      userId,
      packageType,
      status: "pending", // ✅ รอตรวจสอบการชำระเงิน
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // หมดอายุใน 30 วัน
    });

    res.status(200).json({ success: true, subscription });
  } catch (error) {
    console.error("❌ Error in subscribePackage:", error);
    res.status(500).json({ success: false, message: "❌ เกิดข้อผิดพลาดในเซิร์ฟเวอร์" });
  }
};

// ✅ API: ตรวจสอบสถานะ Subscription ของผู้ใช้
exports.getSubscriptionStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const subscription = await Subscription.findOne({ where: { userId } });

    if (!subscription) {
      return res.status(200).json({ hasSubscription: false });
    }

    // ✅ เช็คว่าสมาชิกหมดอายุหรือยัง
    const now = new Date();
    if (new Date(subscription.expiresAt) < now) {
      subscription.status = "expired";
      await subscription.save();
    }

    res.status(200).json({
      hasSubscription: true,
      packageType: subscription.packageType,
      status: subscription.status,
    });
  } catch (error) {
    console.error("❌ Error in getSubscriptionStatus:", error);
    res.status(500).json({ success: false, message: "❌ เกิดข้อผิดพลาดในเซิร์ฟเวอร์" });
  }
};
