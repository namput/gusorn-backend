const TutorProfile = require("../models/TutorProfile");
const User = require("../models/User");

exports.createProfile = async (req, res) => {
  try {
    console.log("🔍 Request Body:", req.body);

    const {
      name,
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

    // ✅ แปลง JSON String เป็น Object ถ้ามาจาก FormData
    const parsedSubjects = subjects ? JSON.parse(subjects) : [];
    const parsedLevels = levels ? JSON.parse(levels) : [];
    const parsedMethods = teachingMethods ? JSON.parse(teachingMethods) : [];
    const parsedCourses = courses ? JSON.parse(courses) : [];
    const parsedSchedule = schedule ? JSON.parse(schedule) : [];

    // ✅ ดึง userId จาก JWT (ที่มาจาก `authenticateUser`)
    const userId = req.user.id;
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(400).json({ success: false, message: "❌ ไม่พบผู้ใช้ที่เกี่ยวข้อง" });
    }

    // ✅ จัดการไฟล์อัปโหลด (ถ้ามี)
    let profileImageUrl = "";
    let introVideoUrl = "";

    if (req.files?.profileImage) {
      profileImageUrl = `uploads/${Date.now()}_${req.files.profileImage[0].originalname}`;
    }
    if (req.files?.introVideo) {
      introVideoUrl = `uploads/${Date.now()}_${req.files.introVideo[0].originalname}`;
    }

    // ✅ สร้างโปรไฟล์ติวเตอร์
    const newProfile = await TutorProfile.create({
      userId,
      name,
      profileImage: profileImageUrl,
      phone,
      location,
      bio,
      subjects: parsedSubjects,
      levels: parsedLevels,
      teachingMethods: parsedMethods,
      experience,
      price,
      courses: parsedCourses,
      schedule: parsedSchedule,
    });

    res.json({ success: true, message: "✅ บันทึกโปรไฟล์สำเร็จ!", data: newProfile });

  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
