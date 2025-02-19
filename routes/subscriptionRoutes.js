
const express = require("express");
const { getSubscriptionStatus } = require("../controllers/subscriptionController");
const { authenticateUser } = require("../middlewares/authMiddleware");
const router = express.Router();

router.get("/status", authenticateUser, getSubscriptionStatus);
// router.post("/cancel", authenticateUser, cancelSubscription);
module.exports = router;