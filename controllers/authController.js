const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { sendVerificationEmail } = require("../utils/emailService");

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

    res.status(201).json({ message: "สมัครสมาชิกสำเร็จ กรุณาตรวจสอบอีเมลเพื่อยืนยันบัญชี", userId: newUser.id });
  } catch (error) {
    console.error("เกิดข้อผิดพลาด:", error);
    res.status(500).json({ error: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // ตรวจสอบว่าผู้ใช้มีอยู่หรือไม่
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" });
    }

    // ตรวจสอบรหัสผ่าน
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" });
    }

    // ตรวจสอบว่าอีเมลถูกยืนยันแล้วหรือยัง
    if (!user.isVerified) {
      return res.status(403).json({ message: "บัญชีของคุณยังไม่ได้รับการยืนยัน กรุณาตรวจสอบอีเมล" });
    }

    // สร้าง Token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );

    res.status(200).json({
      message: "เข้าสู่ระบบสำเร็จ",
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("เกิดข้อผิดพลาด:", error);
    res.status(500).json({ error: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์" });
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
      return res.status(404).json({ message: "ไม่พบอีเมลนี้ในระบบ", verified: false });
    }

    // ส่งสถานะการยืนยันอีเมลกลับไป
    return res.json({ verified: user.isVerified });
  } catch (error) {
    console.error("เกิดข้อผิดพลาด:", error);
    return res.status(500).json({ message: "เกิดข้อผิดพลาดในเซิร์ฟเวอร์", verified: false });
  }
};
