const mongoose = require("mongoose");
const Invoice = require("../models/Invoice");

const {
    sendPaymentReminderEmail
} = require("../services/emailService");

const {
    getOverdueInvoices
} = require("../services/invoiceReminderService");

const {
    generatePaymentReminder
} = require("../services/reminderAIService");

// GET OVERDUE INVOICES
const fetchOverdueInvoices = async (req, res) => {
    try {
        const invoices = await getOverdueInvoices();

        res.status(200).json({
            success: true,
            count: invoices.length,
            invoices
        });

    } catch (error) {
        console.error(
            "Fetch Overdue Invoices Error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Unable to fetch overdue invoices."
        });
    }
};


// GENERATE AI PAYMENT REMINDER
const createPaymentReminder = async (req, res) => {
    try {
        const { invoiceId } = req.params;

        // VALIDATE INVOICE ID
        if (!mongoose.Types.ObjectId.isValid(invoiceId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid invoice ID."
            });
        }

        // FETCH INVOICE FROM DATABASE
        const invoice = await Invoice.findById(invoiceId);

        if (!invoice) {
            return res.status(404).json({
                success: false,
                message: "Invoice not found."
            });
        }

        // CHECK PAYMENT STATUS
        if (invoice.status === "Paid") {
            return res.status(400).json({
                success: false,
                message: "This invoice has already been paid."
            });
        }

        // CHECK DUE DATE
        if (new Date(invoice.dueDate) >= new Date()) {
            return res.status(400).json({
                success: false,
                message: "A reminder can only be generated for an overdue invoice."
            });
        }

        // CALCULATE ONE-TIME LATE FEE
        const lateFeePercentage =
            invoice.lateFeePercentage || 2;

        const lateFeeAmount = Number(
            (
                invoice.amount *
                lateFeePercentage /
                100
            ).toFixed(2)
        );

        const totalOutstanding = Number(
            (
                invoice.amount +
                lateFeeAmount
            ).toFixed(2)
        );

        // ADD CALCULATED VALUES FOR AI REMINDER
        invoice.lateFeePercentage = lateFeePercentage;
        invoice.lateFeeAmount = lateFeeAmount;
        invoice.totalOutstanding = totalOutstanding;

        // GENERATE REMINDER USING GEMINI
        const reminder = await generatePaymentReminder(invoice);

        res.status(200).json({
            success: true,
            invoiceId: invoice._id,
            invoiceNumber: invoice.invoiceNumber,
            subject: reminder.subject,
            message: reminder.message
        });

    } catch (error) {
        console.error(
            "Generate Payment Reminder Error:",
            error.message
        );

        if (error.status === 429) {
            return res.status(429).json({
                success: false,
                message: "AI quota reached. Please try again later."
            });
        }

        if (error.status === 503) {
            return res.status(503).json({
                success: false,
                message: "AI service is temporarily unavailable."
            });
        }

        res.status(500).json({
            success: false,
            message: "Unable to generate payment reminder."
        });
    }
};


// SEND AI PAYMENT REMINDER EMAIL
const sendPaymentReminder = async (req, res) => {
    try {
        const { invoiceId } = req.params;
        const { subject, message } = req.body;

        // VALIDATE INVOICE ID
        if (!mongoose.Types.ObjectId.isValid(invoiceId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid invoice ID."
            });
        }

        // VALIDATE EMAIL CONTENT
        if (!subject || !message) {
            return res.status(400).json({
                success: false,
                message: "Email subject and message are required."
            });
        }

        // FETCH INVOICE
        const invoice = await Invoice.findById(invoiceId);

        if (!invoice) {
            return res.status(404).json({
                success: false,
                message: "Invoice not found."
            });
        }

        // CHECK PAYMENT STATUS
        if (invoice.status === "Paid") {
            return res.status(400).json({
                success: false,
                message: "This invoice has already been paid."
            });
        }

        // CHECK DUE DATE
        if (new Date(invoice.dueDate) >= new Date()) {
            return res.status(400).json({
                success: false,
                message: "Email can only be sent for an overdue invoice."
            });
        }

        // CALCULATE ONE-TIME LATE FEE
        const lateFeePercentage =
            invoice.lateFeePercentage || 2;

        const lateFeeAmount = Number(
            (
                invoice.amount *
                lateFeePercentage /
                100
            ).toFixed(2)
        );

        const totalOutstanding = Number(
            (
                invoice.amount +
                lateFeeAmount
            ).toFixed(2)
        );

        // SEND THE EDITED EMAIL CONTENT THROUGH RESEND
        const emailResult = await sendPaymentReminderEmail({
            to: invoice.customerEmail,
            subject: subject.trim(),
            message: message.trim()
        });

        res.status(200).json({
            success: true,
            message: "Payment reminder email sent successfully.",
            invoiceNumber: invoice.invoiceNumber,
            emailId: emailResult.id,
            subject: subject.trim(),
            recipient: invoice.customerEmail,
            lateFeeAmount,
            totalOutstanding
        });

    } catch (error) {
        console.error(
            "Send Payment Reminder Error:",
            error.message
        );

        if (error.status === 429) {
            return res.status(429).json({
                success: false,
                message: "Email service rate limit reached. Please try again later."
            });
        }

        res.status(500).json({
            success: false,
            message: "Unable to send payment reminder email."
        });
    }
};


module.exports = {
    fetchOverdueInvoices,
    createPaymentReminder,
    sendPaymentReminder
};