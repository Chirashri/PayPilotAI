
const Invoice = require("../models/Invoice");

// GET MONTHLY REVENUE AND FINANCIAL ANALYTICS
const getMonthlyAnalytics = async (req, res) => {
    try {
        const today = new Date();

        // GET THE LAST 12 MONTHS
        const startDate = new Date(
            Date.UTC(
                today.getUTCFullYear(),
                today.getUTCMonth() - 11,
                1
            )
        );

        // FETCH MONTHLY PAYMENT DATA FROM MONGODB
        const monthlyData = await Invoice.aggregate([
            {
                $match: {
                    status: "Paid",
                    paypalCaptureId: {
                        $exists: true,
                        $ne: null
                    },
                    paidAt: {
                        $gte: startDate,
                        $lte: today
                    }
                }
            },
            {
                $group: {
                    _id: {
                        month: {
                            $dateToString: {
                                format: "%Y-%m",
                                date: "$paidAt",
                                timezone: "UTC"
                            }
                        },
                        currency: "$currency"
                    },
                    revenue: {
                        $sum: "$amount"
                    },
                    paymentCount: {
                        $sum: 1
                    }
                }
            },
            {
                $sort: {
                    "_id.month": 1
                }
            }
        ]);

        // GET AVAILABLE CURRENCIES
        const currencies = [
            ...new Set(monthlyData.map(item => item._id.currency))
        ];

        // PREPARE LAST 12 MONTHS
        const monthlyRevenue = [];

        for (let i = 0; i < 12; i++) {
            const date = new Date(
                Date.UTC(
                    today.getUTCFullYear(),
                    today.getUTCMonth() - 11 + i,
                    1
                )
            );

            const monthKey = date.toISOString().slice(0, 7);

            const monthLabel = date.toLocaleDateString(
                "en-US",
                {
                    month: "short",
                    year: "numeric",
                    timeZone: "UTC"
                }
            );

            const monthRecord = {
                month: monthKey,
                label: monthLabel,
                currencies: {}
            };

            currencies.forEach(currency => {
                const record = monthlyData.find(
                    item =>
                        item._id.month === monthKey &&
                        item._id.currency === currency
                );

                monthRecord.currencies[currency] = {
                    revenue: record ? record.revenue : 0,
                    paymentCount: record ? record.paymentCount : 0
                };
            });

            monthlyRevenue.push(monthRecord);
        }

        // CALCULATE REVENUE TOTALS BY CURRENCY
        const totalsByCurrency = {};

        currencies.forEach(currency => {
            const currencyRecords = monthlyData.filter(
                item => item._id.currency === currency
            );

            const totalRevenue = currencyRecords.reduce(
                (total, item) => total + item.revenue,
                0
            );

            const totalPayments = currencyRecords.reduce(
                (total, item) => total + item.paymentCount,
                0
            );

            totalsByCurrency[currency] = {
                totalRevenue,
                totalPayments,
                averagePayment: totalPayments > 0
                    ? Number((totalRevenue / totalPayments).toFixed(2))
                    : 0
            };
        });

        // FETCH PENDING AND OVERDUE INVOICES
        const outstandingData = await Invoice.aggregate([
            {
                $match: {
                    status: {
                        $in: ["Pending", "Overdue"]
                    }
                }
            },
            {
                $group: {
                    _id: "$currency",

                    pendingAmount: {
                        $sum: {
                            $cond: [
                                {
                                    $and: [
                                        { $eq: ["$status", "Pending"] },
                                        { $gte: ["$dueDate", today] }
                                    ]
                                },
                                "$amount",
                                0
                            ]
                        }
                    },

                    pendingCount: {
                        $sum: {
                            $cond: [
                                {
                                    $and: [
                                        { $eq: ["$status", "Pending"] },
                                        { $gte: ["$dueDate", today] }
                                    ]
                                },
                                1,
                                0
                            ]
                        }
                    },

                    overdueAmount: {
                        $sum: {
                            $cond: [
                                {
                                    $or: [
                                        { $eq: ["$status", "Overdue"] },
                                        { $lt: ["$dueDate", today] }
                                    ]
                                },
                                "$amount",
                                0
                            ]
                        }
                    },

                    overdueCount: {
                        $sum: {
                            $cond: [
                                {
                                    $or: [
                                        { $eq: ["$status", "Overdue"] },
                                        { $lt: ["$dueDate", today] }
                                    ]
                                },
                                1,
                                0
                            ]
                        }
                    }
                }
            }
        ]);

        // PREPARE OUTSTANDING TOTALS BY CURRENCY
        const outstandingByCurrency = {};

        outstandingData.forEach(item => {
            outstandingByCurrency[item._id] = {
                pendingAmount: item.pendingAmount,
                pendingCount: item.pendingCount,
                overdueAmount: item.overdueAmount,
                overdueCount: item.overdueCount
            };
        });

        // SEND COMPLETE ANALYTICS RESPONSE
        res.status(200).json({
            success: true,
            period: "Last 12 months",
            monthlyRevenue,
            totalsByCurrency,
            outstandingByCurrency
        });

    } catch (error) {
        console.error(
            "Monthly Analytics Error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Unable to fetch financial analytics."
        });
    }
};

module.exports = {
    getMonthlyAnalytics
};
