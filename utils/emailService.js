const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

exports.sendVerificationEmail = async (email, token) => {
  const verifyLink = `${process.env.EMAIL_VERIFY_URL}?token=${token}`;
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "ยืนยันอีเมลของคุณ",
    html: `<p>กรุณาคลิกลิงก์ด้านล่างเพื่อยืนยันอีเมลของคุณ:</p>
           <a href="${verifyLink}">คลิกที่นี่เพื่อยินยันการสมัครสมาชิกกับ GuSorn </a>`,
  };

  return transporter.sendMail(mailOptions);
};