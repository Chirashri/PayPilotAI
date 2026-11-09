const {
    generateDashboardInsights
} = require("../services/dashboardInsightService");

// GET AI-GENERATED DASHBOARD INSIGHTS
const getDashboardInsights = async (req, res) => {
    try {
        const insights = await generateDashboardInsights();

        res.status(200).json({
            success: true,
            count: insights.length,
            insights
        });

    } catch (error) {
        console.error(
            "Dashboard Insight Controller Error:",
            error.message
        );

        const status = Number(
            error.status ??
            error.statusCode ??
            error.response?.status ??
            error.error?.code ??
            error.code
        );

        res.status(
            status === 429 ? 429 :
            status === 503 ? 503 :
            500
        ).json({
            success: false,
            message: "Unable to generate dashboard insights right now."
        });
    }
};

module.exports = {
    getDashboardInsights
};