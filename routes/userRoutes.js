const express = require("express");
const { getUsers, createUser } = require("../controllers/userController");
const { authenticateUser } = require("../middlewares/authMiddleware");
const router = express.Router();

// router.get("/", getUsers);
router.post("/", createUser);
router.get("/", authenticateUser, getUsers); // ต้องมี Token ใน Header

module.exports = router;

