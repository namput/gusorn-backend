
const express = require("express");
const { getTutorProfile, updateTutorProfile, createTutorProfile } = require("../controllers/tutorController");
const { authenticateUser } = require("../middlewares/authMiddleware");
const { uploadTutorPhoto } = require("../controllers/tutorController");
const upload = require("../middlewares/uploadMiddleware");
const router = express.Router();

router.post("/create", authenticateUser, createTutorProfile);
router.get("/profile", authenticateUser, getTutorProfile);
router.put("/profile/update", authenticateUser, updateTutorProfile);
router.put("/upload-photo", authenticateUser, upload.single("photo"), uploadTutorPhoto);


module.exports = router;

