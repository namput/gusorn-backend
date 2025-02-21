const fs = require("fs");
const TutorProfile = require("../models/TutorProfile");
const User = require("../models/User");
exports.createProfile = async (req, res) => {
  try {
    console.log("🔍 Request Body:", req.body);
    console.log("📂 Uploaded Files:", req.files);

    const {
      name,
      phone,
      email, // ✅ เพิ่ม Email
      location,
      bio,
      subjects,
      levels,
      teachingMethods,
      ageGroups, // ✅ เพิ่ม AgeGroups
      experience,
      price,
      courses,
      schedule,
    } = req.body;

    const parseJSON = (data) => {
      try {
        return data ? JSON.parse(data) : [];
      } catch (err) {
        console.error("❌ JSON Parsing Error:", err);
        return [];
      }
    };

    const parsedSubjects = parseJSON(subjects);
    const parsedLevels = parseJSON(levels);
    const parsedMethods = parseJSON(teachingMethods);
    const parsedAgeGroups = parseJSON(ageGroups); // ✅ เพิ่ม AgeGroups
    const parsedCourses = parseJSON(courses);
    const parsedSchedule = parseJSON(schedule);

    const userId = req.user.id;
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(400).json({ success: false, message: "❌ ไม่พบผู้ใช้ที่เกี่ยวข้อง" });
    }

    let profileImageUrl = "";
    let introVideoUrl = "";

    if (req.files?.profileImage) {
      const imageFile = req.files.profileImage[0];
      profileImageUrl = `uploads/${Date.now()}_${imageFile.originalname}`;
    }

    if (req.files?.introVideo) {
      const videoFile = req.files.introVideo[0];
      introVideoUrl = `uploads/${Date.now()}_${videoFile.originalname}`;
    }

    const newProfile = await TutorProfile.create({
      userId,
      name,
      email, // ✅ บันทึก Email
      phone,
      location,
      bio,
      subjects: parsedSubjects,
      levels: parsedLevels,
      teachingMethods: parsedMethods,
      ageGroups: parsedAgeGroups, // ✅ บันทึก AgeGroups
      experience,
      price,
      courses: parsedCourses,
      schedule: parsedSchedule,
      profileImage: profileImageUrl,
      introVideo: introVideoUrl,
    });

    res.json({ success: true, message: "✅ บันทึกโปรไฟล์สำเร็จ!", data: newProfile });

  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
