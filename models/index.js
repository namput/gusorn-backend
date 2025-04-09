const Thread = require("./Thread");
const Reply = require("./Reply");
const User = require("./User");
const Referral = require("./Referral");
const PaymentProof = require("./PaymentProof");
const Package = require("./Package");
const Templates = require("./Templates");
const TutorProfile = require("./TutorProfile");


// ✅ กำหนดความสัมพันธ์ของ Thread และ Reply
Thread.hasMany(Reply, { foreignKey: "thread_id", as: "replies", onDelete: "CASCADE" });
Reply.belongsTo(Thread, { foreignKey: "thread_id", as: "thread" });

// ✅ กำหนดความสัมพันธ์ของ User และ Reply
User.hasMany(Reply, { foreignKey: "user_id", as: "userReplies", onDelete: "CASCADE" });
Reply.belongsTo(User, { foreignKey: "user_id", as: "user" });

// ✅ กำหนดความสัมพันธ์ของ User และ Thread
User.hasMany(Thread, { foreignKey: "user_id", as: "threads", onDelete: "CASCADE" });
Thread.belongsTo(User, { foreignKey: "user_id", as: "user" });

// ✅ กำหนดความสัมพันธ์ของ Referral
User.hasMany(Referral, { foreignKey: "referrerId", as: "referralsGiven", onDelete: "CASCADE" });
User.hasMany(Referral, { foreignKey: "referredUserId", as: "referralsReceived", onDelete: "CASCADE" });

Referral.belongsTo(User, { foreignKey: "referrerId", as: "referrer" });
Referral.belongsTo(User, { foreignKey: "referredUserId", as: "referredUser" });

// PaymentProof.js
PaymentProof.belongsTo(User, { foreignKey: "userId" });

// TutorProfile.js
TutorProfile.belongsTo(Templates, {
    foreignKey: "templateId",
    as: "template", // ✅ เพิ่มตรงนี้ให้ตรงกับใน include
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });
  
  
  // Templates.js
  Templates.hasMany(TutorProfile, {
    foreignKey: "templateId",
    as: "tutorProfiles", // ใช้หรือไม่ก็ได้
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });
  
  


module.exports = { Thread, Reply, User, Referral, Package, PaymentProof };
