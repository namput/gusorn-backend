const express = require("express");
const { createWebsite } = require("../controllers/websiteController");
const { authenticateUser } = require("../middlewares/authMiddleware");
const router = express.Router();

router.post("/create", authenticateUser, createWebsite);
// router.delete("/delete", authenticateUser, deleteWebsite);

module.exports = router;
