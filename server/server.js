const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");
const invoiceRoutes = require("./routes/invoiceRoutes");
const paypalRoutes = require("./routes/paypalRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const aiRoutes = require("./routes/aiRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const dashboardInsightRoutes = require("./routes/dashboardInsightRoutes");
const invoiceReminderRoutes = require("./routes/invoiceReminderRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// API Routes
app.use("/api/invoices", invoiceRoutes);
app.use("/api/paypal", paypalRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/ai/insights", dashboardInsightRoutes);
app.use("/api/reminders", invoiceReminderRoutes);
// Home Route
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Welcome to PayPilot AI API 🚀",
        version: "1.0.0"
    });
});

// Health Check
app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        status: "Server is running",
        application: "PayPilot AI"
    });
});

// Start Server
const startServer = async () => {
    await connectDB();

    app.listen(PORT, () => {
        console.log("--------------------------------");
        console.log(" PAYPILOT AI SERVER RUNNING ");
        console.log(` http://localhost:${PORT}`);
        console.log("--------------------------------");
    });
};

startServer();