const express = require("express");
const router = express.Router();

const {
    getDashboardInsights
} = require("../controllers/dashboardInsightController");

// GET AI-GENERATED DASHBOARD INSIGHTS
router.get("/", getDashboardInsights);

module.exports = router;