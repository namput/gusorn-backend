const User = require("../models/User");

// ✅ ดึงข้อมูลผู้ใช้ทั้งหมด (สำหรับ Admin เท่านั้น)
exports.getAllUsers = async (req, res) => {
    try {
      const users = await User.findAll({
        attributes: ["id", "username", "email", "role", "referralCode"], // ✅ เพิ่ม referralCode
        order: [["createdAt", "DESC"]],
      });
  
      res.status(200).json({ success: true, data: users });
    } catch (error) {
      console.error("❌ Error fetching users:", error);
      res.status(500).json({
        success: false,
        message: "❌ ไม่สามารถดึงข้อมูลสมาชิกได้",
      });
    }
  };
  

// ✅ อัปเดตสิทธิ์ของผู้ใช้ (User ↔ Admin)
exports.updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    // ตรวจสอบว่า role ที่ส่งมาต้องเป็น "admin" หรือ "user" เท่านั้น
    if (!["admin", "user"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "❌ บทบาทไม่ถูกต้อง ต้องเป็น 'admin' หรือ 'user' เท่านั้น",
      });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "❌ ไม่พบผู้ใช้",
      });
    }

    // ✅ อัปเดต Role ของผู้ใช้
    user.role = role;
    await user.save();

    res.status(200).json({
      success: true,
      message: `✅ เปลี่ยนสิทธิ์เป็น ${role} สำเร็จ!`,
      data: user,
    });
  } catch (error) {
    console.error("❌ Error updating user role:", error);
    res.status(500).json({
      success: false,
      message: "❌ ไม่สามารถอัปเดตสิทธิ์ของผู้ใช้ได้",
    });
  }
};
