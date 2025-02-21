const fs = require("fs");
const TutorProfile = require("../models/TutorProfile");
const User = require("../models/User");

exports.createProfile = async (req, res) => {
  try {
    console.log("🔍 Request Body:", req.body);
    console.log("📂 Uploaded Files:", req.files);
    console.log("🔐 Authenticated User:", req.user);

    // ✅ ตรวจสอบว่า `userId` ถูกต้อง
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "❌ Unauthorized: ไม่พบ User ID" });
    }

    const {
      fullName,
      phone,
      email,
      introduction,
      location,
      teachingMethods,
      ageGroups,
      subjects,
      courses,
      schedule,
      levels, // ✅ ฟิลด์ที่หายไป
      experience, // ✅ ฟิลด์ที่หายไป
      price,
    } = req.body;

    // ✅ ตรวจสอบว่า Email ถูกต้องหรือไม่
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: "❌ รูปแบบ Email ไม่ถูกต้อง" });
    }

    // ✅ แปลง JSON String เป็น Object
    const parsedSubjects = JSON.parse(subjects || "[]");
    const parsedCourses = JSON.parse(courses || "[]");
    const parsedSchedule = JSON.parse(schedule || "[]");
    const parsedTeachingMethods = JSON.parse(teachingMethods || "[]");
    const parsedAgeGroups = JSON.parse(ageGroups || "[]");
    const parsedLevels = JSON.parse(levels || "[]"); // ✅ แปลง Levels ให้เป็น Array

    // ✅ ตรวจสอบไฟล์อัปโหลด (ถ้าไม่มีไฟล์ ให้เป็น `null`)
    let profileImageUrl = req.files?.profileImage?.[0]?.filename || null;
    let introVideoUrl = req.files?.introVideo?.[0]?.filename || null;

    // ✅ แมปค่าตรงกับฐานข้อมูล
    const name = fullName || ""; // `fullName` → `name`
    const parsedPrice = parseInt(price) || 0; // `price` ต้องเป็น INTEGER
    const bio = introduction || ""; // `introduction` → `bio`
    const parsedExperience = experience || null; // `experience` ถ้าไม่มีให้เป็น `null`

    // ✅ บันทึกข้อมูลลงฐานข้อมูล
    const newProfile = await TutorProfile.create({
      userId, // 🔥 ใส่ userId ให้ผูกกับบัญชีผู้ใช้
      name,
      phone,
      email,
      bio,
      location,
      profileImage: profileImageUrl,
      introVideo: introVideoUrl,
      teachingMethods: parsedTeachingMethods,
      ageGroups: parsedAgeGroups,
      subjects: parsedSubjects,
      levels: parsedLevels, // ✅ ใส่ levels เข้าไป
      courses: parsedCourses,
      schedule: parsedSchedule,
      price: parsedPrice,
      experience: parsedExperience, // ✅ ใส่ experience เข้าไป
    });

    res.json({ success: true, message: "✅ บันทึกโปรไฟล์สำเร็จ!", data: newProfile });

  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
