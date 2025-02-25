const Thread = require("./Thread");
const Reply = require("./Reply");
const User = require("./User"); // ✅ เพิ่ม User

// ✅ กำหนดความสัมพันธ์ของ Thread และ Reply
Thread.hasMany(Reply, { foreignKey: "thread_id", as: "Replies", onDelete: "CASCADE" });
Reply.belongsTo(Thread, { foreignKey: "thread_id", as: "Thread" });

// ✅ กำหนดความสัมพันธ์ของ User และ Reply
User.hasMany(Reply, { foreignKey: "user_id", as: "Replies", onDelete: "CASCADE" });
Reply.belongsTo(User, { foreignKey: "user_id", as: "User" }); // ✅ เพิ่มตรงนี้

module.exports = { Thread, Reply, User }; // ✅ ส่งออก User ด้วย
