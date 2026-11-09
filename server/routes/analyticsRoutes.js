
const express = require("express");
const router = express.Router();

const {
    getMonthlyAnalytics
} = require("../controllers/analyticsController");

// GET MONTHLY REVENUE ANALYTICS
router.get("/monthly", getMonthlyAnalytics);

module.exports = router;
