const { Thread, Reply } = require("../models");
const User = require("../models/User");


// ✅ ดึงกระทู้ทั้งหมด
exports.getAllThreads = async (req, res) => {
  try {
    const threads = await Thread.findAll({
      order: [["created_at", "DESC"]],
    });
    res.json(threads);
  } catch (error) {
    console.error("Error fetching threads:", error);
    res.status(500).json({ message: "ไม่สามารถโหลดกระทู้ได้" });
  }
};


// ✅ สร้างกระทู้ใหม่ (ต้องล็อกอิน)
exports.createThread = async (req, res) => {
  try {
    const { title, content } = req.body;
    const user_id = req.user.userId;

    if (!title || !content) {
      return res.status(400).json({ message: "กรุณากรอกข้อมูลให้ครบ" });
    }

    const thread = await Thread.create({ user_id, title, content });
    res.status(201).json({ message: "✅ กระทู้ถูกสร้างแล้ว!", thread });
  } catch (error) {
    console.error("Error creating thread:", error);
    res.status(500).json({ message: "ไม่สามารถสร้างกระทู้ได้" });
  }
};

// ✅ เพิ่มความคิดเห็น (ต้องล็อกอิน)

exports.addReply = async (req, res) => {
    try {
      const { thread_id, content } = req.body;
      const user_id = req.user?.id; // ✅ ดึง ID ของผู้ใช้จาก Token
  
      if (!user_id) {
        return res.status(401).json({ message: "Unauthorized: กรุณาเข้าสู่ระบบ" });
      }
  
      if (!thread_id || !content.trim()) {
        return res.status(400).json({ message: "กรุณากรอกข้อมูลให้ครบ" });
      }
  
      const reply = await Reply.create({ thread_id, user_id, content });
      res.status(201).json({ message: "✅ ความคิดเห็นถูกเพิ่มแล้ว!", reply });
    } catch (error) {
      console.error("Error creating reply:", error);
      res.status(500).json({ message: "ไม่สามารถเพิ่มความคิดเห็นได้" });
    }
  };
  exports.getThreadById = async (req, res) => {
    try {
      const thread = await Thread.findByPk(req.params.id, {
        include: [
          {
            model: Reply,
            as: "Replies",
            include: [
              {
                model: User,
                as: "User",
                attributes: ["id", "username"], // ✅ ดึงแค่ ID และชื่อผู้ใช้
              },
            ],
          },
        ],
        order: [[{ model: Reply, as: "Replies" }, "created_at", "ASC"]],
      });
  
      if (!thread) {
        return res.status(404).json({ message: "ไม่พบกระทู้" });
      }
  
      res.json(thread);
    } catch (error) {
      console.error("Error fetching thread:", error);
      res.status(500).json({ message: "ไม่สามารถโหลดข้อมูลได้" });
    }
  };
  
  
  