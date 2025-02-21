const express = require("express");
const { subscribePackage, getSubscriptionStatus } = require("../controllers/subscriptionController");
const { authenticateUser } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/subscribe", authenticateUser, subscribePackage);
router.get("/status", authenticateUser, getSubscriptionStatus);

module.exports = router;
