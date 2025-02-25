const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST, // ✅ ใช้ `mail.neuatech.com`
  port: process.env.EMAIL_PORT, // ✅ ใช้ 587 (TLS) หรือ 465 (SSL)
  secure: process.env.EMAIL_PORT == "465", // ✅ `true` ถ้าใช้ port 465
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false, // ✅ ปิดการตรวจสอบ Certificate (ป้องกันปัญหากับ SMTP ไม่รองรับ TLS strict)
  },
});

/**
 * 📩 ส่งอีเมลยืนยันการสมัคร
 * @param {string} email - อีเมลของผู้รับ
 * @param {string} token - Token สำหรับยืนยันอีเมล
 */
exports.sendVerificationEmail = async (email, token) => {
  const currentYear = new Date().getFullYear();
  const verifyLink = `${process.env.EMAIL_VERIFY_URL}?token=${token}`;
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: "ยืนยันการสมัครสมาชิกกับ GuSorn",
    html: `
      <div style="background: linear-gradient(to bottom, #007bff, #0056b3); padding: 30px; text-align: center; color: white; font-family: Arial, sans-serif; border-radius: 10px 10px 0 0;">
        <h1 style="margin: 0;">GuSorn</h1>
        <p style="font-size: 18px; margin-top: 5px;">🔹 ยืนยันอีเมลของคุณเพื่อเริ่มต้นใช้งาน!</p>
      </div>

      <div style="padding: 20px; font-family: Arial, sans-serif; text-align: center; background: #f4f4f4;">
        <p style="color: #333; font-size: 16px;">ขอบคุณที่สมัครสมาชิกกับ <strong>GuSorn</strong> 🎉</p>
        <p style="color: #555;">กรุณาคลิกปุ่มด้านล่างเพื่อยืนยันอีเมลของคุณ</p>

        <a href="${verifyLink}" 
          style="display: inline-block; background: #007bff; color: white; padding: 15px 25px; font-size: 18px; 
          text-decoration: none; border-radius: 8px; margin-top: 15px; font-weight: bold;">
          ✅ ยืนยันอีเมลของฉัน
        </a>

        <p style="color: #777; font-size: 14px; margin-top: 20px;">หากคุณไม่ได้สมัครสมาชิก กรุณาละเว้นอีเมลนี้</p>
      </div>

      <div style="background: #222; padding: 15px; text-align: center; color: white; font-size: 12px; border-radius: 0 0 10px 10px;">
        <p>© ${currentYear} neuatech. All rights reserved.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ ส่งอีเมลยืนยันไปที่ ${email} สำเร็จ!`);
  } catch (error) {
    console.error("❌ ไม่สามารถส่งอีเมลยืนยันได้:", error);
    throw new Error("เกิดข้อผิดพลาดในการส่งอีเมล");
  }
};
