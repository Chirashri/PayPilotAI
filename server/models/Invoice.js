const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema(
    {
        invoiceNumber: {
            type: String,
            unique: true,
            required: true
        },
        customerName: {
            type: String,
            required: true,
            trim: true
        },
        customerEmail: {
            type: String,
            required: true,
            lowercase: true,
            trim: true
        },
        description: {
            type: String,
            required: true
        },
                amount: {
            type: Number,
            required: true,
            min: 0.01
        },
        lateFeePercentage: {
            type: Number,
            default: 0,
            min: 0
        },
        lateFeeAmount: {
            type: Number,
            default: 0,
            min: 0
        },
        
        currency: {
            type: String,
            default: "USD",
            uppercase: true
        },
        dueDate: {
            type: Date,
            required: true
        },
        status: {
            type: String,
            enum: ["Pending", "Paid", "Overdue"],
            default: "Pending"
        },
        paypalOrderId: {
            type: String,
            default: null
        },
        paypalCaptureId: {
            type: String,
            default: null
        },
        paidAt: {
            type: Date,
            default: null
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Invoice", invoiceSchema);