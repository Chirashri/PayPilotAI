
const Invoice = require("../models/Invoice");

// CREATE INVOICE
exports.createInvoice = async (req, res) => {
    try {
        const {
            customerName,
            customerEmail,
            description,
            amount,
            dueDate
        } = req.body;

        if (
            !customerName ||
            !customerEmail ||
            !description ||
            !amount ||
            !dueDate
        ) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        if (!Number.isFinite(Number(amount)) || Number(amount) <= 0) {
            return res.status(400).json({
                success: false,
                message: "Amount must be greater than zero"
            });
        }

        if (Number.isNaN(Date.parse(dueDate))) {
            return res.status(400).json({
                success: false,
                message: "Invalid due date"
            });
        }

        const invoiceNumber =
            "INV-" + Date.now() + "-" +
            Math.floor(Math.random() * 1000);

        const invoice = await Invoice.create({
            invoiceNumber,
            customerName,
            customerEmail,
            description,
            amount: Number(amount),
            dueDate
        });

        res.status(201).json({
            success: true,
            message: "Invoice created successfully",
            invoice
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// GET ALL INVOICES
exports.getInvoices = async (req, res) => {
    try {
        const invoices = await Invoice.find().sort({
            createdAt: -1
        });

        res.status(200).json({
            success: true,
            count: invoices.length,
            invoices
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// GET SINGLE INVOICE
exports.getInvoiceById = async (req, res) => {
    try {
        const invoice = await Invoice.findById(req.params.id);

        if (!invoice) {
            return res.status(404).json({
                success: false,
                message: "Invoice not found"
            });
        }

        res.json({
            success: true,
            invoice
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: "Invalid invoice ID"
        });
    }
};

// UPDATE INVOICE
exports.updateInvoice = async (req, res) => {
    try {
        const invoice = await Invoice.findById(req.params.id);

        if (!invoice) {
            return res.status(404).json({
                success: false,
                message: "Invoice not found"
            });
        }

        // PAID INVOICES CANNOT BE EDITED
        if (invoice.status === "Paid") {
            return res.status(400).json({
                success: false,
                message: "Paid invoices cannot be edited."
            });
        }

        const allowedFields = [
            "customerName",
            "customerEmail",
            "description",
            "amount",
            "dueDate",
            "status"
        ];

        const updates = {};

        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        }

        Object.assign(invoice, updates);

        await invoice.save();

        res.json({
            success: true,
            message: "Invoice updated successfully",
            invoice
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};
// DELETE INVOICE
exports.deleteInvoice = async (req, res) => {
    try {
        const invoice = await Invoice.findByIdAndDelete(
            req.params.id
        );

        if (!invoice) {
            return res.status(404).json({
                success: false,
                message: "Invoice not found"
            });
        }

        res.json({
            success: true,
            message: "Invoice deleted successfully"
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};
