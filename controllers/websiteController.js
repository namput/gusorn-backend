const Website = require("../models/Website");
const User = require("../models/User");

exports.createWebsite = async (req, res) => {
  try {
    const userId = req.user.userId; // ดึง userId จาก JWT
    const { subdomain, template, seoSettings } = req.body;

    // ตรวจสอบว่าผู้ใช้เป็นติวเตอร์หรือไม่
    const user = await User.findByPk(userId);
    if (!user || user.role !== "tutor") {
      return res
        .status(403)
        .json({ message: "เฉพาะติวเตอร์เท่านั้นที่สามารถสร้างเว็บไซต์ได้" });
    }

    // ตรวจสอบว่ามี subdomain ซ้ำหรือไม่
    const existingWebsite = await Website.findOne({ where: { subdomain } });
    if (existingWebsite) {
      return res.status(400).json({ message: "Subdomain นี้ถูกใช้ไปแล้ว" });
    }

    // สร้างเว็บไซต์
    const newWebsite = await Website.create({
      userId,
      subdomain,
      template,
      seoSettings: seoSettings || {},
    });

    res.status(201).json({
      message: "สร้างเว็บไซต์สำเร็จ!",
      website: newWebsite,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateWebsite = async (req, res) => {
  try {
    const userId = req.user.userId; // ดึง userId จาก JWT
    const { subdomain, template, seoSettings } = req.body;

    // ค้นหาเว็บไซต์ที่เป็นของผู้ใช้
    let website = await Website.findOne({ where: { userId } });

    if (!website) {
      return res.status(404).json({ message: "ไม่พบเว็บไซต์ของคุณ" });
    }

    // อัปเดตข้อมูล
    website.subdomain = subdomain || website.subdomain;
    website.template = template || website.template;
    website.seoSettings = seoSettings || website.seoSettings;

    await website.save();

    res.status(200).json({
      message: "อัปเดตข้อมูลเว็บไซต์สำเร็จ!",
      website,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteWebsite = async (req, res) => {
  try {
    const userId = req.user.userId; // ดึง userId จาก JWT

    // ค้นหาเว็บไซต์ที่เป็นของผู้ใช้
    let website = await Website.findOne({ where: { userId } });

    if (!website) {
      return res.status(404).json({ message: "ไม่พบเว็บไซต์ของคุณ" });
    }

    // ลบเว็บไซต์
    await website.destroy();

    res.status(200).json({ message: "ลบเว็บไซต์สำเร็จ!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
