const express = require("express");
const router = express.Router();

const {
    testAI,
    askFinancialAI
} = require("../controllers/aiController");

// Test Gemini connection
router.get("/test", testAI);

// Ask financial questions
router.post("/ask", askFinancialAI);

module.exports = router;