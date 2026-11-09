
const Invoice = require("../models/Invoice");

// Get all completed PayPal transactions
const getTransactions = async (req, res) => {
    try {
        const transactions = await Invoice.find({
            status: "Paid",
            paypalCaptureId: {
                $exists: true,
                $ne: null
            }
        })
        .select(
            "invoiceNumber customerName customerEmail description amount currency status paypalOrderId paypalCaptureId paidAt"
        )
        .sort({ paidAt: -1 });

        const totalAmount = transactions.reduce(
            (total, transaction) => total + transaction.amount,
            0
        );

        res.status(200).json({
            success: true,
            count: transactions.length,
            totalAmount,
            transactions
        });

    } catch (error) {
        console.error("Get Transactions Error:", error.message);

        res.status(500).json({
            success: false,
            message: "Unable to fetch transactions."
        });
    }
};

module.exports = {
    getTransactions
};
