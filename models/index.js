const Thread = require("./Thread");
const Reply = require("./Reply");

// ✅ กำหนดความสัมพันธ์ให้ตรงกัน
Thread.hasMany(Reply, { foreignKey: "thread_id", as: "Replies", onDelete: "CASCADE" });
Reply.belongsTo(Thread, { foreignKey: "thread_id", as: "Thread" });

module.exports = { Thread, Reply };
