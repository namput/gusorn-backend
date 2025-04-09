const express = require("express");
const { authenticateUser } = require("../middlewares/authMiddleware");
const { getAllTemplates } = require("../controllers/templateController");



const router = express.Router();
router.get("/", authenticateUser, getAllTemplates);
module.exports = router;
