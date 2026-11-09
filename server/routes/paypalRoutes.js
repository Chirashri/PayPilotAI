const express = require("express");
const router = express.Router();

const {
    createPayPalOrder,
    capturePayPalOrder
} = require("../controllers/paypalController");

// Create an order for an invoice
router.post("/create-order/:invoiceId", createPayPalOrder);

// Capture an approved PayPal order
router.post("/capture-order", capturePayPalOrder);

module.exports = router;