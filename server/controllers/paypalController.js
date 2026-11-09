
const axios = require("axios");
const Invoice = require("../models/Invoice");
const { getPayPalAccessToken } = require("../services/paypalService");

const PAYPAL_BASE_URL =
    process.env.PAYPAL_BASE_URL || "https://api-m.sandbox.paypal.com";

// CREATE PAYPAL ORDER
const createPayPalOrder = async (req, res) => {
    try {
        const { invoiceId } = req.params;

        // Find invoice
        const invoice = await Invoice.findById(invoiceId);

        if (!invoice) {
            return res.status(404).json({
                success: false,
                message: "Invoice not found"
            });
        }

        // Only pending invoices can be paid
        if (invoice.status !== "Pending") {
            return res.status(400).json({
                success: false,
                message: "Only pending invoices can be paid"
            });
        }

        // Validate amount
        const amount = Number(invoice.amount);

        if (!Number.isFinite(amount) || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid invoice amount"
            });
        }

        // Get PayPal access token
        const accessToken = await getPayPalAccessToken();

        // PayPal order payload
        const orderPayload = {
            intent: "CAPTURE",

            // Top-level application context
            application_context: {
                brand_name: "PayPilot AI",
                landing_page: "NO_PREFERENCE",
                user_action: "PAY_NOW",
                shipping_preference: "NO_SHIPPING",
                return_url: "http://localhost:5173/payment-success",
                cancel_url: "http://localhost:5173/payment-cancel"
            },

            // Invoice payment details
            purchase_units: [
                {
                    reference_id: invoice._id.toString(),
                    custom_id: invoice._id.toString(),
                    invoice_id: invoice.invoiceNumber,
                    description: invoice.description,

                    amount: {
                        currency_code: invoice.currency || "USD",
                        value: amount.toFixed(2)
                    }
                }
            ]
        };

        // Create order through PayPal
        const response = await axios.post(
            `${PAYPAL_BASE_URL}/v2/checkout/orders`,
            orderPayload,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                    Prefer: "return=representation"
                }
            }
        );

        // Save PayPal order ID against invoice
        invoice.paypalOrderId = response.data.id;
        await invoice.save();

        // Find approval link
        const approvalLink = response.data.links?.find(
            (link) =>
                link.rel === "approve" ||
                link.rel === "payer-action"
        );

        if (!approvalLink) {
            return res.status(500).json({
                success: false,
                message: "PayPal did not return an approval link"
            });
        }

        return res.status(201).json({
            success: true,
            message: "PayPal order created successfully",
            orderID: response.data.id,
            approvalUrl: approvalLink.href
        });

    } catch (error) {
        console.error(
            "Create PayPal Order Error:",
            error.response?.data || error.message
        );

        return res.status(500).json({
            success: false,
            message: "Unable to create PayPal order"
        });
    }
};


// CAPTURE PAYPAL PAYMENT
const capturePayPalOrder = async (req, res) => {
    try {
        const { orderID } = req.body;

        if (!orderID) {
            return res.status(400).json({
                success: false,
                message: "PayPal order ID is required"
            });
        }

        // Find invoice linked to this PayPal order
        const invoice = await Invoice.findOne({
            paypalOrderId: orderID
        });

        if (!invoice) {
            return res.status(404).json({
                success: false,
                message: "No invoice found for this PayPal order"
            });
        }

        // Prevent duplicate payment processing
        if (invoice.status === "Paid") {
            return res.json({
                success: true,
                message: "Invoice has already been paid",
                invoice
            });
        }

        // Get PayPal access token
        const accessToken = await getPayPalAccessToken();

        // Capture payment
        const response = await axios.post(
            `${PAYPAL_BASE_URL}/v2/checkout/orders/${encodeURIComponent(orderID)}/capture`,
            {},
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                    Prefer: "return=representation"
                }
            }
        );

        const paypalOrder = response.data;

        const capture =
            paypalOrder.purchase_units?.[0]?.payments?.captures?.[0];

        // Verify PayPal payment status
        if (
            paypalOrder.status !== "COMPLETED" ||
            !capture ||
            capture.status !== "COMPLETED"
        ) {
            return res.status(400).json({
                success: false,
                message: "PayPal payment was not completed"
            });
        }

        // Verify captured amount and currency
        const capturedAmount = Number(capture.amount?.value);
        const expectedAmount = Number(invoice.amount);

        const capturedCurrency = capture.amount?.currency_code;
        const expectedCurrency = invoice.currency || "USD";

        if (
            capturedAmount !== expectedAmount ||
            capturedCurrency !== expectedCurrency
        ) {
            console.error("PayPal capture amount or currency mismatch", {
                invoiceId: invoice._id,
                expectedAmount,
                capturedAmount,
                expectedCurrency,
                capturedCurrency
            });

            return res.status(400).json({
                success: false,
                message: "Payment amount or currency does not match the invoice"
            });
        }

        // Update invoice after verified payment
        invoice.status = "Paid";
        invoice.paypalCaptureId = capture.id;
        invoice.paidAt = new Date();

        await invoice.save();

        return res.json({
            success: true,
            message: "Payment completed and invoice marked as Paid",
            invoice
        });

    } catch (error) {
        console.error(
            "Capture PayPal Payment Error:",
            error.response?.data || error.message
        );

        return res.status(500).json({
            success: false,
            message: "Unable to capture PayPal payment"
        });
    }
};


module.exports = {
    createPayPalOrder,
    capturePayPalOrder
};
