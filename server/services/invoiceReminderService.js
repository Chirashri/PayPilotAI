const Invoice = require("../models/Invoice");

// GET ALL UNPAID OVERDUE INVOICES
const getOverdueInvoices = async () => {
    try {
        const today = new Date();

        const invoices = await Invoice.find({
            status: {
                $in: ["Pending", "Overdue"]
            },
            dueDate: {
                $lt: today
            }
        })
        .select(
            "invoiceNumber customerName customerEmail description amount currency status dueDate lateFeePercentage lateFeeAmount"
        )
        .sort({ dueDate: 1 });

        // CALCULATE ONE-TIME LATE FEE
        const updatedInvoices = invoices.map((invoice) => {
            const invoiceData = invoice.toObject();

            const lateFeePercentage =
                invoiceData.lateFeePercentage || 2;

            const lateFeeAmount =
                Number(
                    (
                        invoiceData.amount *
                        lateFeePercentage /
                        100
                    ).toFixed(2)
                );

            const totalOutstanding =
                Number(
                    (
                        invoiceData.amount +
                        lateFeeAmount
                    ).toFixed(2)
                );

            return {
                ...invoiceData,
                lateFeePercentage,
                lateFeeAmount,
                totalOutstanding
            };
        });

        return updatedInvoices;

    } catch (error) {
        console.error(
            "Overdue Invoice Service Error:",
            error.message
        );

        throw error;
    }
};

module.exports = {
    getOverdueInvoices
};