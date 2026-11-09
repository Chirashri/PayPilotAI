const Invoice = require("../models/Invoice");

// GET FINANCIAL SUMMARY FROM MONGODB
const getFinancialSummary = async () => {
    try {
        const invoices = await Invoice.find()
            .select(
                "invoiceNumber customerName customerEmail description amount currency status dueDate paidAt paypalCaptureId"
            )
            .sort({ createdAt: -1 });

        const today = new Date();

        const totalInvoices = invoices.length;

        const paidInvoices = invoices.filter(
            invoice => invoice.status === "Paid"
        );

        const pendingInvoices = invoices.filter(
            invoice => invoice.status === "Pending"
        );

        const overdueInvoices = invoices.filter(
            invoice =>
                invoice.status !== "Paid" &&
                new Date(invoice.dueDate) < today
        );

        const totalRevenue = paidInvoices.reduce(
            (total, invoice) => total + invoice.amount,
            0
        );

        const pendingAmount = pendingInvoices.reduce(
            (total, invoice) => total + invoice.amount,
            0
        );

        const overdueAmount = overdueInvoices.reduce(
            (total, invoice) => total + invoice.amount,
            0
        );

        const transactions = paidInvoices
            .filter(invoice => invoice.paypalCaptureId)
            .map(invoice => ({
                invoiceNumber: invoice.invoiceNumber,
                customerName: invoice.customerName,
                amount: invoice.amount,
                currency: invoice.currency,
                paidAt: invoice.paidAt
            }));

        return {
            totalInvoices,
            paidCount: paidInvoices.length,
            pendingCount: pendingInvoices.length,
            overdueCount: overdueInvoices.length,
            totalRevenue,
            pendingAmount,
            overdueAmount,
            transactions
        };

    } catch (error) {
        console.error(
            "Financial Summary Error:",
            error.message
        );

        throw error;
    }
};

module.exports = {
    getFinancialSummary
};