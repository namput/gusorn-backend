const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ✅ ตรวจสอบและสร้างโฟลเดอร์แยกสำหรับการอัปโหลด
const directories = {
  profileImage: path.join(__dirname, "../uploads/profile_images"),
  introVideo: path.join(__dirname, "../uploads/intro_videos"),
  paymentProof: path.join(__dirname, "../uploads/payment_proofs"),
};

// ✅ สร้างโฟลเดอร์ถ้ายังไม่มี
Object.values(directories).forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`📂 สร้างโฟลเดอร์ ${dir} สำเร็จ!`);
  }
});

// ✅ กำหนด Storage สำหรับอัปโหลดทั่วไป (Profile & Video)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === "profileImage") {
      cb(null, directories.profileImage);
    } else if (file.fieldname === "introVideo") {
      cb(null, directories.introVideo);
    } else {
      cb(new Error("❌ ประเภทไฟล์ไม่ถูกต้อง"));
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

// ✅ ตรวจสอบประเภทไฟล์ทั่วไป
const fileFilter = (req, file, cb) => {
  const imageTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  const videoTypes = ["video/mp4", "video/quicktime", "video/x-msvideo"];

  if (file.fieldname === "profileImage" && !imageTypes.includes(file.mimetype)) {
    return cb(new Error("❌ อนุญาตเฉพาะไฟล์ JPG, JPEG, PNG, WEBP เท่านั้น!"));
  }
  if (file.fieldname === "introVideo" && !videoTypes.includes(file.mimetype)) {
    return cb(new Error("❌ อนุญาตเฉพาะไฟล์ MP4, MOV, AVI เท่านั้น!"));
  }

  cb(null, true);
};

// ✅ ตั้งค่า Multer สำหรับ Profile & Video
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 1024, // จำกัดขนาดไฟล์ 200MB (สำหรับวิดีโอ)
  },
});

// ✅ กำหนด Storage และ File Filter สำหรับ Payment Proofs
const storagePaymentProof = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, directories.paymentProof);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilterPaymentProof = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new Error("❌ อนุญาตเฉพาะไฟล์ JPG, JPEG, PNG, WEBP เท่านั้น!"));
  }
  cb(null, true);
};

// ✅ ตั้งค่า Multer สำหรับ Payment Proofs
const uploadPaymentProof = multer({
  storage: storagePaymentProof,
  fileFilter: fileFilterPaymentProof,
  limits: { fileSize: 5 * 1024 * 1024 }, // จำกัดขนาดไฟล์ 5MB
});

// ✅ Export Middleware
module.exports = { upload, uploadPaymentProof };
