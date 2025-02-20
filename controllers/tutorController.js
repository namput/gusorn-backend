const TutorProfile = require("../models/TutorProfile");
exports.getTutorProfile = async (req, res) => {
    try {
      // ตรวจสอบว่า JWT มี userId หรือไม่
      if (!req.user || !req.user.userId) {
        return res.status(401).json({ message: "Unauthorized: ไม่พบข้อมูลผู้ใช้" });
      }
  
      const userId = req.user.userId; // ดึง userId จาก JWT
  
      // ค้นหาโปรไฟล์ของติวเตอร์
      const tutorProfile = await TutorProfile.findOne({ where: { userId } });
  
      if (!tutorProfile) {
        return res.status(404).json({ message: "ไม่พบโปรไฟล์ติวเตอร์" });
      }
  
      res.status(200).json(tutorProfile);
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการดึงโปรไฟล์ติวเตอร์:", error);
      res.status(500).json({ error: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์" });
    }
  };

exports.updateTutorProfile = async (req, res) => {
  try {
    const userId = req.user.userId; // ดึงค่า userId จาก JWT
    
    const { name, bio, subjects, price, photo } = req.body;

    // ค้นหาโปรไฟล์ติวเตอร์
    let tutorProfile = await TutorProfile.findOne({ where: { userId } });

    if (!tutorProfile) {
      return res.status(404).json({ message: "ไม่พบโปรไฟล์ติวเตอร์" });
    }

    // อัปเดตข้อมูล
    tutorProfile.name = name || tutorProfile.name;
    tutorProfile.bio = bio || tutorProfile.bio;
    tutorProfile.subjects = subjects || tutorProfile.subjects;
    tutorProfile.price = price || tutorProfile.price;
    tutorProfile.photo = photo || tutorProfile.photo;

    await tutorProfile.save();

    res.status(200).json({
      message: "อัปเดตโปรไฟล์สำเร็จ!",
      tutorProfile,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.uploadTutorPhoto = async (req, res) => {
  try {
    const userId = req.user.userId; // ดึง userId จาก JWT

    if (!req.file) {
      return res.status(400).json({ message: "กรุณาอัปโหลดไฟล์รูปภาพ" });
    }

    // สร้าง URL ของรูปภาพ
    const photoUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;

    // ค้นหาและอัปเดตรูปภาพโปรไฟล์ของติวเตอร์
    let tutorProfile = await TutorProfile.findOne({ where: { userId } });

    if (!tutorProfile) {
      return res.status(404).json({ message: "ไม่พบโปรไฟล์ติวเตอร์" });
    }

    tutorProfile.photo = photoUrl;
    await tutorProfile.save();

    res.status(200).json({
      message: "อัปโหลดรูปโปรไฟล์สำเร็จ!",
      photo: photoUrl,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createTutorProfile = async (req, res) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: "Unauthorized: ไม่พบข้อมูลผู้ใช้" });
    }

    const { name, subject, experience, rating } = req.body;
    const userId = req.user.userId;

    // ตรวจสอบว่าผู้ใช้มีโปรไฟล์ติวเตอร์อยู่แล้วหรือไม่
    const existingProfile = await TutorProfile.findOne({ where: { userId } });
    if (existingProfile) {
      return res.status(400).json({ message: "คุณมีโปรไฟล์ติวเตอร์อยู่แล้ว" });
    }

    // ✅ สร้างโปรไฟล์ติวเตอร์ใหม่
    const tutorProfile = await TutorProfile.create({
      userId,
      name,
      subject,
      experience,
      rating: rating || 0,
    });

    res.status(201).json({ message: "สร้างโปรไฟล์ติวเตอร์สำเร็จ", tutorProfile });
  } catch (error) {
    console.error("เกิดข้อผิดพลาด:", error);
    res.status(500).json({ error: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์" });
  }
};


exports.createProfile = async (req, res) => {
  try {
    const {
      userId,
      name,
      profileImage,
      phone,
      location,
      bio,
      subjects,
      levels,
      teachingMethods,
      experience,
      price,
      courses,
      schedule,
    } = req.body;

    const newProfile = await TutorProfile.create({
      userId,
      name,
      profileImage,
      phone,
      location,
      bio,
      subjects,
      levels,
      teachingMethods,
      experience,
      price,
      courses,
      schedule,
    });

    res.json({ success: true, message: "✅ บันทึกโปรไฟล์สำเร็จ!", data: newProfile });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

