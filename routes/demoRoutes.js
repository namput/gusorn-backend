const express = require("express");
const { getDataDemo } = require("../controllers/demoController");
const router = express.Router();
router.get("/tutor/data", getDataDemo);
module.exports = router;