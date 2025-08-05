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
    <div style="background: linear-gradient(to bottom, #3b8d99, #6b8f94); padding: 50px 20px; text-align: center; color: white; font-family: 'Roboto', sans-serif; border-radius: 15px 15px 0 0;">
      <h1 style="margin: 0; font-size: 50px; font-weight: bold; letter-spacing: 2px;">GuSorn</h1>
      <p style="font-size: 22px; margin-top: 10px; font-weight: 500;">ยืนยันอีเมลของคุณและเข้าร่วมครอบครัว GuSorn!</p>
    </div>

    <div style="padding: 40px 20px; background-color: #ffffff; text-align: center; font-family: 'Roboto', sans-serif; color: #333; border-radius: 0 0 15px 15px;">
      <p style="font-size: 18px; font-weight: 600; margin-bottom: 15px;">ขอบคุณที่สมัครสมาชิกกับ <strong style="color: #3b8d99;">GuSorn</strong> 🌟</p>
      <p style="font-size: 16px; margin-bottom: 25px;">เพื่อเริ่มต้นการเดินทางของคุณกับเรา กรุณาคลิกปุ่มด้านล่างเพื่อยืนยันอีเมลของคุณ</p>

      <a href="${verifyLink}" 
        style="background: #ff9f00; color: white; padding: 20px 45px; font-size: 22px; text-decoration: none; border-radius: 12px; font-weight: 700; display: inline-block; box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2); transition: all 0.3s ease-in-out;">
        ✅ ยืนยันอีเมลของฉัน
      </a>

      <p style="font-size: 14px; color: #777; margin-top: 20px;">หากคุณไม่ได้สมัครสมาชิก กรุณาละเว้นอีเมลนี้ หรือไม่ต้องทำอะไรเลย</p>
    </div>

    <div style="background-color: #222; padding: 15px; text-align: center; color: white; font-size: 12px; border-radius: 0 0 15px 15px;">
      <p>© ${currentYear} GuSorn. All rights reserved. | <a href="https://guson.co" style="color: #ff9f00; text-decoration: none;">Visit GuSorn</a></p>
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

exports.sendNewSubscriptionEmail = async (packageName, email) => {
  const currentYear = new Date().getFullYear();
  const adminLink = `${process.env.CLIENT_URL}`; // 🔗 ลิงก์ไปหน้าจัดการแพ็กเกจ
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: process.env.EMAIL_REGISTER, // ✉️ ส่งไปที่อีเมล Admin
    subject: "📢 แจ้งเตือน: มีการสมัครแพ็กเกจใหม่บน GuSorn!",
    html: `
    <div style="background: linear-gradient(to right, #192f6a, #2e4a7f); padding: 50px 20px; text-align: center; color: white; font-family: 'Roboto', sans-serif; border-radius: 15px 15px 0 0;">
      <h1 style="margin: 0; font-size: 42px; font-weight: bold; letter-spacing: 2px;">🚀 GuSorn</h1>
      <p style="font-size: 20px; margin-top: 10px; font-weight: 500;">มีผู้ใช้สมัครแพ็กเกจใหม่!</p>
    </div>

    <div style="padding: 40px 20px; background-color: #ffffff; text-align: center; font-family: 'Roboto', sans-serif; color: #333; border-radius: 0 0 15px 15px;">
      <p style="font-size: 18px; font-weight: 600; margin-bottom: 15px;">📌 รายละเอียดการสมัครแพ็กเกจ</p>
      <p style="font-size: 16px; margin-bottom: 10px;"><strong>📧 อีเมล:</strong> ${email}</p>
      <p style="font-size: 16px; margin-bottom: 10px;"><strong>💼 แพ็กเกจ:</strong> ${packageName}</p>
      <p style="font-size: 16px; margin-bottom: 25px;">📅 วันที่สมัคร: ${new Date().toLocaleDateString(
        "th-TH"
      )}</p>

      <a href="${adminLink}" 
        style="background: #ff9f00; color: white; padding: 15px 35px; font-size: 18px; text-decoration: none; border-radius: 10px; font-weight: 700; display: inline-block; box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2); transition: all 0.3s ease-in-out;">
        🔍 จัดการแพ็กเกจในระบบ
      </a>

      <p style="font-size: 14px; color: #777; margin-top: 20px;">⚠️ โปรดตรวจสอบข้อมูลและดำเนินการหากจำเป็น</p>
    </div>

    <div style="background-color: #222; padding: 15px; text-align: center; color: white; font-size: 12px; border-radius: 0 0 15px 15px;">
      <p>&copy; ${currentYear} GuSorn. All rights reserved. | <a href="https://guson.co" style="color: #ff9f00; text-decoration: none;">Visit GuSorn</a></p>
    </div>
  `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ ส่งอีเมลแจ้งเตือน Admin สำเร็จ!`);
  } catch (error) {
    console.error("❌ ไม่สามารถส่งอีเมลแจ้งเตือนได้:", error);
    throw new Error("เกิดข้อผิดพลาดในการส่งอีเมลแจ้งเตือน");
  }
};

exports.sendSubscriptionConfirmationEmail = async (packageDetails, email) => {
  const currentYear = new Date().getFullYear();
  const supportEmail = process.env.SUPPORT_EMAIL || "support@gusorn.com";

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: "กรุณารอการอนุมัติ",
    html: `
    <div style="background: linear-gradient(to right, #192f6a, #2e4a7f); padding: 50px 20px; text-align: center; color: white; font-family: 'Roboto', sans-serif; border-radius: 15px 15px 0 0;">
      <h1 style="margin: 0; font-size: 42px; font-weight: bold; letter-spacing: 2px;">🚀 GuSorn</h1>
      <p style="font-size: 20px; margin-top: 10px; font-weight: 500;">คุณได้สมัครแพ็ก</p>
    </div>

    <div style="padding: 40px 20px; background-color: #ffffff; text-align: center; font-family: 'Roboto', sans-serif; color: #333; border-radius: 0 0 15px 15px;">
      <p style="font-size: 18px; font-weight: 600;">✅ รายละเอียดแพ็กเกจของคุณ</p>
      <p style="font-size: 16px; margin-bottom: 10px;"><strong>📧 อีเมล:</strong> ${email}</p>
      <p style="font-size: 16px; margin-bottom: 10px;"><strong>💼 แพ็กเกจ:</strong> ${packageDetails}</p>

      <p style="font-size: 16px; margin-bottom: 20px; color: #ff9f00;">
        🕒 กรุณารอการอนุมัติจากแอดมิน ระบบจะพร้อมใช้งานภายใน 24 ชั่วโมง
      </p>

      <p style="font-size: 14px; color: #777; margin-top: 10px;">
        หากไม่สามารถใช้งานได้หลังจาก 24 ชั่วโมง กรุณาติดต่อฝ่าย Support ที่ 
        <a href="mailto:${supportEmail}" style="color: #ff9f00; text-decoration: none;">${supportEmail}</a>
      </p>
    </div>

    <div style="background-color: #222; padding: 15px; text-align: center; color: white; font-size: 12px; border-radius: 0 0 15px 15px;">
      <p>© ${currentYear} GuSorn. All rights reserved. | <a href="https://guson.co" style="color: #ff9f00; text-decoration: none;">Visit GuSorn</a></p>
    </div>
  `,
  };

  try {

    await transporter.sendMail(mailOptions);
    console.log(`✅ อีเมลแจ้งเตือนการสมัครแพ็กเกจถูกส่งไปที่ ${email}`);
  } catch (error) {
    console.error("❌ ไม่สามารถส่งอีเมลแจ้งเตือนได้:", error);
    throw new Error("เกิดข้อผิดพลาดในการส่งอีเมล");
  }
};
exports.sendApprovalNotificationEmail = async ( user, packageDetails) => {
  const currentYear = new Date().getFullYear();
  const dashboardLink = `${process.env.CLIENT_URL}`;

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: user.email,
    subject: "✅ แพ็กเกจของคุณได้รับการอนุมัติแล้ว! พร้อมใช้งาน 🎉",
    html: `
    <div style="background: linear-gradient(to right, #192f6a, #2e4a7f); padding: 50px 20px; text-align: center; color: white; font-family: 'Roboto', sans-serif; border-radius: 15px 15px 0 0;">
      <h1 style="margin: 0; font-size: 42px; font-weight: bold; letter-spacing: 2px;">🚀 GuSorn</h1>
      <p style="font-size: 20px; margin-top: 10px; font-weight: 500;">แพ็กเกจของคุณได้รับการอนุมัติแล้ว! 🎉</p>
    </div>

    <div style="padding: 40px 20px; background-color: #ffffff; text-align: center; font-family: 'Roboto', sans-serif; color: #333; border-radius: 0 0 15px 15px;">
      <p style="font-size: 18px; font-weight: 600;">📌 รายละเอียดแพ็กเกจของคุณ</p>
      <p style="font-size: 16px; margin-bottom: 10px;"><strong>👤 ชื่อผู้ใช้:</strong> ${user.name}</p>
      <p style="font-size: 16px; margin-bottom: 10px;"><strong>📧 อีเมล:</strong> ${user.email}</p>
      <p style="font-size: 16px; margin-bottom: 10px;"><strong>💼 แพ็กเกจ:</strong> ${packageDetails.packageType}</p>
      <p style="font-size: 16px; margin-bottom: 10px;"><strong>📅 วันที่สมัคร:</strong> ${packageDetails.startDate}</p>
      <p style="font-size: 16px; margin-bottom: 25px;"><strong>⏳ วันหมดอายุ:</strong> ${packageDetails.expiresAt}</p>

      <p style="font-size: 16px; margin-bottom: 20px; color: #4CAF50;">
        ✅ ตอนนี้คุณสามารถใช้ subdomain ของคุณได้ทันที!
      </p>

      <a href="${dashboardLink}" 
        style="background: #ff9f00; color: white; padding: 15px 35px; font-size: 18px; text-decoration: none; border-radius: 10px; font-weight: 700; display: inline-block; box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2); transition: all 0.3s ease-in-out;">
        🔧 จัดการเว็บไซต์ของฉัน
      </a>

      <p style="font-size: 14px; color: #777; margin-top: 20px;">
        หากพบปัญหาหรือไม่สามารถใช้งานได้ กรุณาติดต่อฝ่าย Support
      </p>
    </div>

    <div style="background-color: #222; padding: 15px; text-align: center; color: white; font-size: 12px; border-radius: 0 0 15px 15px;">
      <p>© ${currentYear} GuSorn. All rights reserved. | <a href="https://guson.co" style="color: #ff9f00; text-decoration: none;">Visit GuSorn</a></p>
    </div>
  `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ อีเมลแจ้งเตือนการอนุมัติแพ็กเกจถูกส่งไปที่ ${user.email}`);
  } catch (error) {
    console.error("❌ ไม่สามารถส่งอีเมลแจ้งเตือนได้:", error);
    throw new Error("เกิดข้อผิดพลาดในการส่งอีเมล");
  }
};
exports.sendRejectionNotificationEmail = async ( user, packageDetails) => {
  const currentYear = new Date().getFullYear();
  const supportEmail = process.env.SUPPORT_EMAIL || "support@gusorn.com";
  const dashboardLink = `${process.env.CLIENT_URL}`;

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: user.email,
    subject: "❌ สมัครแพ็กเกจไม่สำเร็จ - โปรดดำเนินการใหม่",
    html: `
    <div style="background: linear-gradient(to right, #a83232, #c0392b); padding: 50px 20px; text-align: center; color: white; font-family: 'Roboto', sans-serif; border-radius: 15px 15px 0 0;">
      <h1 style="margin: 0; font-size: 42px; font-weight: bold; letter-spacing: 2px;">🚨 GuSorn</h1>
      <p style="font-size: 20px; margin-top: 10px; font-weight: 500;">ขออภัย! การสมัครแพ็กเกจของคุณไม่ผ่านการอนุมัติ</p>
    </div>

    <div style="padding: 40px 20px; background-color: #ffffff; text-align: center; font-family: 'Roboto', sans-serif; color: #333; border-radius: 0 0 15px 15px;">
      <p style="font-size: 18px; font-weight: 600;">📌 รายละเอียดแพ็กเกจของคุณ</p>
      <p style="font-size: 16px; margin-bottom: 10px;"><strong>👤 ชื่อผู้ใช้:</strong> ${user.name}</p>
      <p style="font-size: 16px; margin-bottom: 10px;"><strong>📧 อีเมล:</strong> ${user.email}</p>
      <p style="font-size: 16px; margin-bottom: 10px;"><strong>💼 แพ็กเกจ:</strong> ${packageDetails.packageId}</p>
      <p style="font-size: 16px; margin-bottom: 10px;"><strong>📅 วันที่สมัคร:</strong> ${packageDetails.createdAt}</p>

      <p style="font-size: 18px; color: #e74c3c; font-weight: bold; margin-bottom: 15px;">
        🚫 เหตุผลที่ไม่ผ่านการอนุมัติ:
      </p>
      <p style="font-size: 16px; background: #f8d7da; color: #721c24; padding: 10px; border-radius: 8px; display: inline-block;">
        ข้อมูลไม่ถูกต้อง หรือ ไม่สมบูรณ์
      </p>

      <p style="font-size: 16px; margin-top: 25px;">
        หากต้องการสมัครใหม่ กรุณาคลิกปุ่มด้านล่างเพื่อแก้ไขข้อมูลและสมัครอีกครั้ง
      </p>

      <a href="${dashboardLink}" 
        style="background: #ff9f00; color: white; padding: 15px 35px; font-size: 18px; text-decoration: none; border-radius: 10px; font-weight: 700; display: inline-block; box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2); transition: all 0.3s ease-in-out;">
        🔄 สมัครแพ็กเกจใหม่
      </a>

      <p style="font-size: 14px; color: #777; margin-top: 20px;">
        หากมีข้อสงสัย กรุณาติดต่อฝ่าย Support ที่ 
        <a href="mailto:${supportEmail}" style="color: #ff9f00; text-decoration: none;">${supportEmail}</a>
      </p>
    </div>

    <div style="background-color: #222; padding: 15px; text-align: center; color: white; font-size: 12px; border-radius: 0 0 15px 15px;">
      <p>© ${currentYear} GuSorn. All rights reserved. | <a href="https://guson.co" style="color: #ff9f00; text-decoration: none;">Visit GuSorn</a></p>
    </div>
  `,
  };

  try {

    await transporter.sendMail(mailOptions);
    console.log(`❌ อีเมลแจ้งเตือนการปฏิเสธแพ็กเกจถูกส่งไปที่ ${user.email}`);
  } catch (error) {
    console.error("❌ ไม่สามารถส่งอีเมลแจ้งเตือนได้:", error);
    throw new Error("เกิดข้อผิดพลาดในการส่งอีเมล");
  }
};

// ✅ ฟังก์ชันส่งอีเมลสำหรับ "ลืมรหัสผ่าน"
exports.sendResetPasswordEmail = async (email, resetToken) => {
  const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: "🔑 คำขอรีเซ็ตรหัสผ่าน",
    html: `
    <div style="text-align: center; font-family: 'Arial', sans-serif;">
      <h2 style="color: #333;">🔑 รีเซ็ตรหัสผ่านของคุณ</h2>
      <p>กดที่ลิงก์ด้านล่างเพื่อรีเซ็ตรหัสผ่านของคุณ:</p>
      <a href="${resetLink}" 
         style="background: #007bff; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">
        🔑 รีเซ็ตรหัสผ่าน
      </a>
      <p>ลิงก์นี้จะหมดอายุใน 1 ชั่วโมง</p>
    </div>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ อีเมลรีเซ็ตรหัสผ่านถูกส่งไปที่ ${email}`);
  } catch (error) {
    console.error("❌ ไม่สามารถส่งอีเมลรีเซ็ตรหัสผ่านได้:", error);
    throw new Error("เกิดข้อผิดพลาดในการส่งอีเมลรีเซ็ตรหัสผ่าน");
  }
};
