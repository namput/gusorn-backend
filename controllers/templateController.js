const User = require("../models/User");
const Templates = require("../models/Templates");

exports.getAllTemplates = async (req, res) => {
  try {
    const templates = await Templates.findAll();
    res.status(200).json({ success: true, templates });
  } catch (error) {
    console.error("❌ Error fetching templates:", error);
    res.status(500).json({ success: false, message: "❌ เกิดข้อผิดพลาดในเซิร์ฟเวอร์" });
  }
}
