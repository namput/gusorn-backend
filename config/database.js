
require("dotenv").config();
const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT,
    logging: false,
  }
);

async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log("✅ เชื่อมต่อฐานข้อมูลสำเร็จ!");
  } catch (error) {
    console.log( "process.env.DB_NAME :",process.env.DB_NAME, "process.env.DB_USER :",process
    .env.DB_USER, "process.env.DB_PASS :",process.env.DB_PASS, "process.env.DB_HOST :",process.env.DB_HOST);
    
    console.error("❌ ไม่สามารถเชื่อมต่อฐานข้อมูล:", error);
  }
}

testConnection();

module.exports = sequelize;