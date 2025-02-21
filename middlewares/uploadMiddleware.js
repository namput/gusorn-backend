const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ✅ ตรวจสอบและสร้างโฟลเดอร์ `uploads/`
const uploadDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log("📂 สร้างโฟลเดอร์ uploads สำเร็จ!");
}

// ✅ กำหนดขนาดไฟล์สูงสุด
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_VIDEO_SIZE = 1024 * 1024 * 1024; // 200MB

// ✅ กำหนด Storage สำหรับอัปโหลดไฟล์
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // 📂 บันทึกไฟล์ลงโฟลเดอร์ uploads
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname)); // ตั้งชื่อไฟล์ให้ไม่ซ้ำกัน
  },
});

// ✅ ตรวจสอบประเภทและขนาดไฟล์
const fileFilter = (req, file, cb) => {
  const imageTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  const videoTypes = ["video/mp4", "video/quicktime", "video/x-msvideo"];

  if (imageTypes.includes(file.mimetype)) {
    if (file.size > MAX_IMAGE_SIZE) {
      req.fileValidationError = "❌ ไฟล์รูปภาพต้องไม่เกิน 5MB!";
      return cb(null, false);
    }
  } else if (videoTypes.includes(file.mimetype)) {
    if (file.size > MAX_VIDEO_SIZE) {
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
  limits: { fileSize: MAX_VIDEO_SIZE }, // **ใช้ max video size (ใหญ่สุด)**
});

module.exports = upload;
