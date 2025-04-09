const express = require("express");
const { createWebsite, getWebsite } = require("../controllers/websiteController");
const { authenticateUser } = require("../middlewares/authMiddleware");
const router = express.Router();

router.post("/create", authenticateUser, createWebsite);
// router.delete("/delete", authenticateUser, deleteWebsite);
router.get("/:subdomain", getWebsite);

module.exports = router;
