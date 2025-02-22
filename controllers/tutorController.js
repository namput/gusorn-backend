const fs = require("fs");
const path = require("path");
const TutorProfile = require("../models/TutorProfile");

// ✅ ตั้งค่าพาธอัปโหลดให้ตรงกับ `uploadMiddleware.js`
const UPLOADS_DIR = "/uploads";
const PROFILE_IMAGES_DIR = `${UPLOADS_DIR}/profile_images`;
const INTRO_VIDEOS_DIR = `${UPLOADS_DIR}/intro_videos`;

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
      levels,
      experience,
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
    const parsedLevels = JSON.parse(levels || "[]");

    // ✅ ตรวจสอบไฟล์อัปโหลด (ถ้าไม่มีไฟล์ ให้เป็น `null`)
    const profileImageUrl = req.files?.profileImage
      ? `${PROFILE_IMAGES_DIR}/${req.files.profileImage[0].filename}`
      : null;

    const introVideoUrl = req.files?.introVideo
      ? `${INTRO_VIDEOS_DIR}/${req.files.introVideo[0].filename}`
      : null;

    // ✅ แมปค่าตรงกับฐานข้อมูล
    const name = fullName || "";
    const parsedPrice = parseInt(price) || 0;
    const bio = introduction || "";
    const parsedExperience = experience || null;

    // ✅ บันทึกข้อมูลลงฐานข้อมูล
    const newProfile = await TutorProfile.create({
      userId,
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
      levels: parsedLevels,
      courses: parsedCourses,
      schedule: parsedSchedule,
      price: parsedPrice,
      experience: parsedExperience,
    });

    res.json({ success: true, message: "✅ บันทึกโปรไฟล์สำเร็จ!", data: newProfile });

  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
