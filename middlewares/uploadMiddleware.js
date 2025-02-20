const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ✅ ตรวจสอบว่ามีโฟลเดอร์ uploads หรือไม่ ถ้าไม่มีให้สร้าง
const uploadDir = "uploads/";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ✅ กำหนด Storage สำหรับอัปโหลดไฟล์
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // 📂 เก็บไฟล์ในโฟลเดอร์ uploads
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname)); // ตั้งชื่อไฟล์ใหม่
  },
});

// ✅ ตรวจสอบประเภทไฟล์ที่รองรับ
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|mp4|mov|avi/; // ✅ รองรับวิดีโอ
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    return cb(new Error("อนุญาตเฉพาะไฟล์ JPEG, JPG, PNG, MP4, MOV, AVI เท่านั้น!"));
  }
};

// ✅ ตั้งค่าอัปโหลดไฟล์ (จำกัด 5MB สำหรับรูป และ 50MB สำหรับวิดีโอ)
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 500 * 1024 * 1024 }, // ✅ จำกัดไฟล์ที่ 50MB
});

module.exports = upload;
