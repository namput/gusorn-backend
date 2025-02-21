const fs = require("fs");
const TutorProfile = require("../models/TutorProfile");
const User = require("../models/User");

exports.createProfile = async (req, res) => {
  try {
    console.log("🔍 Request Body:", req.body);
    console.log("📂 Uploaded Files:", req.files);

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
      price,
    } = req.body;

    // ✅ ตรวจสอบว่ามี `userId` มาจาก JWT หรือไม่
    console.log("🔐 Authenticated User:", req.user);
    
    const userId = req.user?.userId; // ต้องแน่ใจว่า `authenticateUser` Middleware ใช้ถูกต้อง
    if (!userId) {
      return res.status(401).json({ success: false, message: "❌ Unauthorized: ไม่พบ User ID" });
    }

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

    // ✅ ตรวจสอบไฟล์อัปโหลด
    let profileImageUrl = req.files?.profileImage?.[0]?.filename || "";
    let introVideoUrl = req.files?.introVideo?.[0]?.filename || "";

    // ✅ บันทึกข้อมูลลงฐานข้อมูล
    const newProfile = await TutorProfile.create({
      userId, // 🔥 ต้องใส่ userId เข้าไปเพื่อผูกกับผู้ใช้
      name: fullName,
      phone,
      email,
      introduction,
      location,
      profileImage: profileImageUrl,
      introVideo: introVideoUrl,
      teachingMethods: parsedTeachingMethods,
      ageGroups: parsedAgeGroups,
      subjects: parsedSubjects,
      courses: parsedCourses,
      schedule: parsedSchedule,
      price,
    });

    res.json({ success: true, message: "✅ บันทึกโปรไฟล์สำเร็จ!", data: newProfile });

  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
