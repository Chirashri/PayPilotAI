
const express = require("express");
const router = express.Router();

const {
    fetchOverdueInvoices,
    createPaymentReminder,
    sendPaymentReminder
} = require("../controllers/invoiceReminderController");

router.post(
    "/send/:invoiceId",
    sendPaymentReminder
);

// GET ALL OVERDUE INVOICES
router.get("/overdue", fetchOverdueInvoices);

// GENERATE AI PAYMENT REMINDER
router.post("/generate/:invoiceId", createPaymentReminder);

module.exports = router;
