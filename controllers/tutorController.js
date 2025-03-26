const fs = require("fs");
const path = require("path");
const TutorProfile = require("../models/TutorProfile");
const { User } = require("../models");

// ✅ ตั้งค่าพาธอัปโหลดให้ตรงกับ `uploadMiddleware.js`
const UPLOADS_DIR = "https://apigusorn.neuatech.com/uploads";
const PROFILE_IMAGES_DIR = `${UPLOADS_DIR}/profile_images`;
const INTRO_VIDEOS_DIR = `${UPLOADS_DIR}/intro_videos`;

exports.createOrUpdateProfile = async (req, res) => {
  try {
    // ✅ ตรวจสอบว่า `userId` ถูกต้อง
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "❌ Unauthorized: ไม่พบ User ID" });
    }

    const {
      tutorId, // ✅ เช็ค tutorId ถ้ามีให้ทำการอัปเดต
      fullName,
      phone,
      email,
      introduction,
      subdomain,
      location,
      teachingMethods,
      ageGroups,
      subjects,
      courses,
      schedule,
      levels,
      experience,
      price,
      template,
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

    if (tutorId) {
      // ✅ อัปเดตโปรไฟล์ ถ้ามี `tutorId`
      const existingProfile = await TutorProfile.findOne({ where: { id: tutorId, userId } });

      if (!existingProfile) {
        return res.status(404).json({ success: false, message: "❌ ไม่พบโปรไฟล์ติวเตอร์" });
      }

      // ✅ อัปเดตข้อมูล
      await existingProfile.update({
        name,
        phone,
        email,
        bio,
        location,
        subdomain,
        profileImage: profileImageUrl ? "https://apigusorn.neuatech.com" + profileImageUrl : existingProfile.profileImage,
        introVideo: introVideoUrl ? "https://apigusorn.neuatech.com" + introVideoUrl : existingProfile.introVideo,
        teachingMethods: parsedTeachingMethods,
        ageGroups: parsedAgeGroups,
        subjects: parsedSubjects,
        levels: parsedLevels,
        courses: parsedCourses,
        schedule: parsedSchedule,
        price: parsedPrice,
        experience: parsedExperience,
        template,
      });

      return res.json({ success: true, message: "✅ อัปเดตโปรไฟล์สำเร็จ!", data: existingProfile });
    } else {
      // ✅ สร้างโปรไฟล์ใหม่ ถ้ายังไม่มี `tutorId`
      const newProfile = await TutorProfile.create({
        userId,
        name,
        phone,
        email,
        bio,
        location,
        subdomain,
        profileImage: "https://apigusorn.neuatech.com" + profileImageUrl,
        introVideo: "https://apigusorn.neuatech.com" + introVideoUrl,
        teachingMethods: parsedTeachingMethods,
        ageGroups: parsedAgeGroups,
        subjects: parsedSubjects,
        levels: parsedLevels,
        courses: parsedCourses,
        schedule: parsedSchedule,
        price: parsedPrice,
        experience: parsedExperience,
        template,
      });

      return res.json({ success: true, message: "✅ บันทึกโปรไฟล์สำเร็จ!", data: newProfile });
    }
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getTutorProfile = async (req, res) => {
  try {
    const userId = req.user.userId; // ✅ ดึง ID ของผู้ใช้ที่ล็อกอินอยู่

    // ✅ ค้นหาโปรไฟล์ของติวเตอร์
    const tutorProfile = await TutorProfile.findOne({
      where: { userId },
      include: [
        {
          model: User,
          attributes: ["id", "email", "username"], // ✅ ดึงข้อมูลพื้นฐานจาก User
        },
      ],
    });

    if (!tutorProfile) {
      return res.status(404).json({ success: false, message: "ไม่พบโปรไฟล์ติวเตอร์" });
    }

    res.status(200).json({ success: true, data: tutorProfile });
  } catch (error) {
    console.error("❌ เกิดข้อผิดพลาดในการโหลดโปรไฟล์:", error);
    res.status(500).json({ success: false, message: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์" });
  }
};
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ["id", "username", "email", "role", "referralCode"], // ✅ เพิ่ม referralCode
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "❌ ไม่พบผู้ใช้",
      });
    }

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    console.error("❌ Error fetching user profile:", error);
    res.status(500).json({
      success: false,
      message: "❌ ไม่สามารถดึงข้อมูลโปรไฟล์ได้",
    });
  }
};

