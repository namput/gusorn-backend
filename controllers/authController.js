const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { sendVerificationEmail } = require("../utils/emailService");
const TutorProfile = require("../models/TutorProfile");
const Subscription = require("../models/Subscription");
const PaymentProof = require("../models/PaymentProof");
const Referral  = require("../models/Referral");
const sequelize = require("../config/database");


const generateReferralCode = async () => {
  let referralCode;
  let existingUser;
  do {
    referralCode = Math.random().toString(36).substr(2, 6).toUpperCase();
    existingUser = await User.findOne({ where: { referralCode } });
  } while (existingUser);
  return referralCode;
};

exports.register = async (req, res) => {
  try {
    const { name, username, email, phone, password, role, referralCode } = req.body;

    // ✅ ตรวจสอบว่าชื่อผู้ใช้ซ้ำหรือไม่
    const existingUsername = await User.findOne({ where: { username } });
    if (existingUsername)
      return res.status(400).json({ message: "ชื่อผู้ใช้นี้ถูกใช้ไปแล้ว" });

    // ✅ ตรวจสอบว่าอีเมลซ้ำหรือไม่
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser)
      return res.status(400).json({ message: "อีเมลนี้ถูกใช้ไปแล้ว" });

    // ✅ ตรวจสอบว่าเบอร์โทรศัพท์ซ้ำหรือไม่
    const existingPhone = await User.findOne({ where: { phone } });
    if (existingPhone)
      return res
        .status(400)
        .json({ message: "หมายเลขโทรศัพท์นี้ถูกใช้ไปแล้ว" });

    // ✅ เข้ารหัสรหัสผ่าน
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // ✅ สร้างรหัสเชิญใหม่ให้ผู้ใช้
    const newReferralCode = await generateReferralCode();

    // ✅ ตรวจสอบว่ามีการใช้รหัสเชิญหรือไม่
    let referrerId = null;
    if (referralCode) {
      const referrer = await User.findOne({ where: { referralCode: referralCode } });
      if (referrer) {
        referrerId = referrer.id; // บันทึกว่าใครเป็นผู้เชิญ
      } else {
        return res.status(400).json({ message: "รหัสเชิญไม่ถูกต้อง" });
      }
    }

    // ✅ สร้างผู้ใช้ใหม่
    const newUser = await User.create({
      name,
      username,
      email,
      phone,
      password: hashedPassword,
      role: role || "tutor",
      referralCode: newReferralCode,
      referrerId,
    });

    // ✅ หากมี referrer → บันทึกค่าคอมมิชชั่น (ยังไม่จ่ายจนกว่าสมัครแพ็กเกจ)
    if (referrerId) {
      await Referral.create({
        referrerId,
        referredUserId: newUser.id,
        commission: 50, // ✅ ต้องอัปเดตให้เป็น % ของแพ็กเกจในฟังก์ชัน subscribePackage
        status: "pending",
      });
    }

    // ✅ ส่งอีเมลยืนยัน
    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email },
      process.env.JWT_EMAIL_SECRET,
      { expiresIn: "1h" }
    );

    await sendVerificationEmail(newUser.email, token);

    res.status(201).json({
      message: "สมัครสมาชิกสำเร็จ กรุณาตรวจสอบอีเมลเพื่อยืนยันบัญชี",
      userId: newUser.id,
    });
  } catch (error) {
    console.error("❌ เกิดข้อผิดพลาด:", error);
    res.status(500).json({ error: "❌ เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์" });
  }
};

// ✅ เข้าสู่ระบบ

exports.login = async (req, res) => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connection is active");

    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "❌ อีเมลหรือรหัสผ่านไม่ถูกต้อง" });
    }

    if (!user.isVerified) {
      return res.status(403).json({ message: "❌ บัญชีของคุณยังไม่ได้รับการยืนยัน กรุณาตรวจสอบอีเมล" });
    }

    // ✅ ดึงข้อมูลที่เกี่ยวข้องพร้อมกัน
    const [payment, subscription, tutorProfile] = await Promise.all([
      PaymentProof.findOne({ where: { userId: user.id }, order: [["createdAt", "DESC"]] }),
      Subscription.findOne({ where: { userId: user.id, status: "active" }, order: [["createdAt", "DESC"]] }),
      TutorProfile.findOne({ where: { userId: user.id } }),
    ]);

    const hasProfile = !!tutorProfile;
    const packageType = subscription?.packageType || null;
    const packageStatus = subscription?.status || "none";

    // ✅ กำหนดเส้นทาง Redirect หลัง Login
    let redirectPath = "/select-package";
    if (payment) {
      if (payment.status === "pending") redirectPath = "/pending-status";
      else if (payment.status === "approved") {
        if (!subscription) redirectPath = "/select-package";
        else if (subscription.expiresAt && new Date(subscription.expiresAt) < new Date()) {
          redirectPath = "/select-package";
        } else if (subscription.status === "pending") {
          redirectPath = "/pending-status";
        } else {
          redirectPath = packageType === "basic" ? "/create-profile" : "/dashboard";
        }
      }
    }

    // ✅ สร้าง Token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // ✅ ส่งข้อมูลเพิ่มเติม
    res.status(200).json({
      message: "✅ เข้าสู่ระบบสำเร็จ",
      token,
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
        referralCode: user.referralCode || null, // ✅ ส่งรหัสเชิญด้วย
        hasProfile,
        package: packageType,
        packageStatus,
        redirectPath,
      },
    });
  } catch (error) {
    console.error("❌ เกิดข้อผิดพลาด:", error);
    res.status(500).json({ error: "❌ เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์" });
  }
};


// ✅ ยืนยันอีเมล
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).json({ message: "Token ไม่ถูกต้อง" });

    const decoded = jwt.verify(token, process.env.JWT_EMAIL_SECRET);
    const user = await User.findByPk(decoded.userId);

    if (!user) return res.status(404).json({ message: "ไม่พบผู้ใช้" });

    if (user.isVerified)
      return res.redirect("https://www.gusorn.com/dashboard");

    user.isVerified = true;
    await user.save();

    return res.redirect("https://www.gusorn.com/dashboard");
  } catch (error) {
    console.error("❌ เกิดข้อผิดพลาด:", error);
    res.status(400).json({ message: "Token ไม่ถูกต้องหรือหมดอายุ" });
  }
};

// ✅ สมัครแพ็กเกจ
exports.subscribePackage = async (req, res) => {
  try {
    const { packageType } = req.body;
    const userId = req.user.userId;

    const packageDetails = {
      basic: 99,
      standard: 199,
      premium: 299,
      business: 399,
    };

    if (!Object.keys(packageDetails).includes(packageType))
      return res.status(400).json({ message: "❌ แพ็กเกจไม่ถูกต้อง" });

    // ✅ ตรวจสอบว่าผู้ใช้มี Subscription อยู่แล้วหรือไม่
    const existingSubscription = await Subscription.findOne({
      where: { userId, status: "active" },
    });

    if (existingSubscription)
      return res
        .status(400)
        .json({ message: "❌ คุณมีแพ็กเกจที่ใช้งานอยู่แล้ว" });

    const newSubscription = await Subscription.create({
      userId,
      packageType,
      price: packageDetails[packageType],
      status: "pending",
      startDate: new Date(),
      expiresAt: new Date(new Date().setMonth(new Date().getMonth() + 1)),
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
