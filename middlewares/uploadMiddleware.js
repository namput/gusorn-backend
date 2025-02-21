const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ✅ ตรวจสอบว่ามีโฟลเดอร์ `uploads/` หรือไม่ ถ้าไม่มีให้สร้าง
const uploadDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log("📂 สร้างโฟลเดอร์ uploads สำเร็จ!");
}

// ✅ ตั้งค่า Storage สำหรับอัปโหลดไฟล์
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // 📂 บันทึกไฟล์ในโฟลเดอร์ uploads
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname)); // ตั้งชื่อไฟล์ใหม่
  },
});

// ✅ ตรวจสอบประเภทและขนาดไฟล์
const fileFilter = (req, file, cb) => {
  const imageTypes = /jpeg|jpg|png|webp/;
  const videoTypes = /mp4|mov|avi/;
  const extname = path.extname(file.originalname).toLowerCase();
  const mimetype = file.mimetype;

  // ✅ จำกัดขนาดแยกกัน (ภาพ: 5MB, วิดีโอ: 200MB)
  if (imageTypes.test(extname) && imageTypes.test(mimetype)) {
    if (file.size > 10 * 1024 * 1024) {
      req.fileValidationError = "❌ ไฟล์รูปภาพต้องไม่เกิน 5MB!";
      return cb(null, false);
    }
  } else if (videoTypes.test(extname) && videoTypes.test(mimetype)) {
    if (file.size > 1024 * 1024 * 1024) {
      req.fileValidationError = "❌ ไฟล์วิดีโอต้องไม่เกิน 200MB!";
      return cb(null, false);
    }
  } else {
    return cb(new Error("❌ อนุญาตเฉพาะไฟล์ JPEG, JPG, PNG, WEBP, MP4, MOV, AVI เท่านั้น!"));
  }

  cb(null, true);
};

// ✅ ตั้งค่า Multer
const upload = multer({
  storage,
  fileFilter,
});

module.exports = upload;
