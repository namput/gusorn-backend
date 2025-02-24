const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { sendVerificationEmail } = require("../utils/emailService");
const TutorProfile = require("../models/TutorProfile");
const Subscription = require("../models/Subscription");
const PaymentProof = require("../models/PaymentProof");

exports.register = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // ตรวจสอบว่ามีบัญชีอยู่แล้วหรือไม่
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "อีเมลนี้ถูกใช้ไปแล้ว" });
    }

    // เข้ารหัสรหัสผ่าน
    const hashedPassword = await bcrypt.hash(password, 10);

    // สร้างผู้ใช้ใหม่
    const newUser = await User.create({
      email,
      password: hashedPassword,
      role: role || "tutor", // ค่า default เป็น tutor
    });

    // ส่งอีเมลยืนยัน
    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email },
      process.env.JWT_EMAIL_SECRET,
      { expiresIn: "1h" }
    );

    await sendVerificationEmail(newUser.email, token);

    res
      .status(201)
      .json({
        message: "สมัครสมาชิกสำเร็จ กรุณาตรวจสอบอีเมลเพื่อยืนยันบัญชี",
        userId: newUser.id,
      });
  } catch (error) {
    console.error("เกิดข้อผิดพลาด:", error);
    res.status(500).json({ error: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user)
      return res
        .status(401)
        .json({ message: "❌ อีเมลหรือรหัสผ่านไม่ถูกต้อง" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res
        .status(401)
        .json({ message: "❌ อีเมลหรือรหัสผ่านไม่ถูกต้อง" });

    if (!user.isVerified) {
      return res
        .status(403)
        .json({
          message: "❌ บัญชีของคุณยังไม่ได้รับการยืนยัน กรุณาตรวจสอบอีเมล",
        });
    }

    const tutorProfile = await TutorProfile.findOne({
      where: { userId: user.id },
    });
    const hasProfile = !!tutorProfile;
    // ✅ ตรวจสอบหลักฐานการชำระเงินล่าสุด
    const payment = await PaymentProof.findOne({
      where: { userId: user.id },
      order: [["createdAt", "DESC"]],
    });

    // ✅ ตรวจสอบ Subscription ปัจจุบันของผู้ใช้
    const subscription = await Subscription.findOne({
      where: { userId: user.id, status: "active" },
      order: [["createdAt", "DESC"]],
    });

    // 🎯 **กำหนด `redirectPath` ตามเงื่อนไขที่กำหนด**
    let redirectPath = "/select-package"; // ค่าเริ่มต้น

    if (!payment || payment.status === "rejected") {
      redirectPath = "/select-package"; // ❌ ไม่มีรายการ หรือ ถูกปฏิเสธ
    } else if (payment.status === "pending") {
      redirectPath = "/pending-status"; // ⏳ รอตรวจสอบ
    } else if (payment.status === "approved") {
      if (!subscription) {
        redirectPath = "/select-package"; // ❌ ไม่มี Subscription
      } else if (new Date(subscription.expiresAt) < new Date()) {
        redirectPath = "/select-package"; // ❌ Subscription หมดอายุ
      } else if (subscription.status === "pending") {
        redirectPath = "/pending-status"; // ⏳ Subscription รอตรวจสอบ
      } else if (subscription.packageType === "basic") {
        redirectPath = "/create-profile"; // ✅ แพ็กเกจ Basic → ไปสร้างโปรไฟล์
      } else {
        redirectPath = "/dashboard"; // ✅ แพ็กเกจอื่น → ไปแดชบอร์ด
      }
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "✅ เข้าสู่ระบบสำเร็จ",
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      hasProfile,
      package: subscription?.packageType || null,
      packageStatus: subscription?.status || "none",
      redirectPath,
    });
  } catch (error) {
    console.error("❌ เกิดข้อผิดพลาด:", error);
    res.status(500).json({ error: "❌ เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์" });
  }
};

exports.sendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;

    // ตรวจสอบว่ามีบัญชีนี้หรือไม่
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "ไม่พบอีเมลนี้ในระบบ" });
    }

    // สร้าง Token สำหรับยืนยันอีเมล
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_EMAIL_SECRET,
      { expiresIn: "1h" }
    );

    // ส่งอีเมล
    await sendVerificationEmail(user.email, token);

    res.status(200).json({ message: "ส่งลิงก์ยืนยันอีเมลเรียบร้อยแล้ว" });
  } catch (error) {
    console.error("เกิดข้อผิดพลาด:", error);
    res.status(500).json({ error: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์" });
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ message: "Token ไม่ถูกต้อง" });
    }

    // ตรวจสอบ Token
    const decoded = jwt.verify(token, process.env.JWT_EMAIL_SECRET);

    // อัปเดตสถานะของผู้ใช้
    const user = await User.findByPk(decoded.userId);
    if (!user) {
      return res.status(404).json({ message: "ไม่พบผู้ใช้" });
    }

    if (user.isVerified) {
      return res.redirect("https://www.gusorn.com");
    }

    user.isVerified = true;
    await user.save();

    return res.redirect("https://www.gusorn.com");
  } catch (error) {
    console.error("เกิดข้อผิดพลาด:", error);
    res.status(400).json({ message: "Token ไม่ถูกต้องหรือหมดอายุ" });
  }
};
exports.checkVerification = async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ message: "กรุณาระบุอีเมล" });
    }

    // ค้นหาผู้ใช้จากอีเมล
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res
        .status(404)
        .json({ message: "ไม่พบอีเมลนี้ในระบบ", verified: false });
    }

    // ส่งสถานะการยืนยันอีเมลกลับไป
    return res.json({ verified: user.isVerified });
  } catch (error) {
    console.error("เกิดข้อผิดพลาด:", error);
    return res
      .status(500)
      .json({ message: "เกิดข้อผิดพลาดในเซิร์ฟเวอร์", verified: false });
  }
};

exports.subscribePackage = async (req, res) => {
  try {
    const { packageType } = req.body;
    const userId = req.user.userId;

    const packageDetails = {
      basic: { price: 99 },
      standard: { price: 199 },
      premium: { price: 299 },
      business: { price: 399 },
    };

    if (!packageDetails[packageType]) {
      return res.status(400).json({ message: "❌ แพ็กเกจไม่ถูกต้อง" });
    }

    // ✅ สร้าง Subscription ใหม่
    const newSubscription = await Subscription.create({
      userId,
      packageType,
      price: packageDetails[packageType].price,
      status: "pending", // ✅ เริ่มต้นเป็น pending รอตรวจสอบ
      startDate: new Date(),
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)), // หมดอายุใน 1 เดือน
    });

    res
      .status(201)
      .json({
        message: "✅ สมัครแพ็กเกจสำเร็จ!",
        subscription: newSubscription,
      });
  } catch (error) {
    console.error("❌ เกิดข้อผิดพลาด:", error);
    res.status(500).json({ error: "❌ เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์" });
  }
};
