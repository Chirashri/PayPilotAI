import { useState, useEffect } from "react";
import InvoicePage from "./InvoicePage";
import TransactionsPage from "./TransactionsPage";
import AIAssistantPage from "./AIAssistantPage";
import InvoiceRemindersPage from "./pages/InvoiceRemindersPage";

import {
  getMonthlyAnalytics,
  getTransactions,
  getDashboardInsights
} from "./services/api";

import {
  LayoutDashboard,
  Wallet,
  Receipt,
  BrainCircuit,
  Settings,
  Bell,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  Clock,
  CheckCircle2,
  Sparkles
} from "lucide-react";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from "recharts";

import "./App.css";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";

// SIDEBAR NAVIGATION
const navigation = [
  { name: "Dashboard", icon: LayoutDashboard },
  { name: "Transactions", icon: Wallet },
  { name: "Invoices", icon: Receipt },
  { name: "AI Payment Reminders", icon: Bell },
  { name: "AI Assistant", icon: BrainCircuit },
  { name: "Settings", icon: Settings }
];

function DashboardApp() {
  const [activePage, setActivePage] = useState("Dashboard");

  // ANALYTICS STATE
  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [analyticsError, setAnalyticsError] = useState("");

  // TRANSACTION STATE
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [transactionsLoading, setTransactionsLoading] = useState(true);
  const [transactionsError, setTransactionsError] = useState("");

  // AI DASHBOARD INSIGHTS STATE
  const [aiInsights, setAiInsights] = useState([]);
  const [insightsLoading, setInsightsLoading] = useState(true);
  const [insightsError, setInsightsError] = useState("");
  const [insightsRefreshKey, setInsightsRefreshKey] = useState(0);

  // FETCH REAL FINANCIAL ANALYTICS
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setAnalyticsLoading(true);
        setAnalyticsError("");

        const response = await getMonthlyAnalytics();

        if (!response.success) {
          throw new Error("Unable to fetch analytics.");
        }

        setAnalytics(response);

      } catch (error) {
        console.error("Dashboard Analytics Error:", error);
        setAnalyticsError("Unable to load financial analytics.");

      } finally {
        setAnalyticsLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  // FETCH REAL RECENT TRANSACTIONS
  useEffect(() => {
    const fetchRecentTransactions = async () => {
      try {
        setTransactionsLoading(true);
        setTransactionsError("");

        const response = await getTransactions();

        if (!response.success) {
          throw new Error("Unable to fetch transactions.");
        }

        setRecentTransactions(response.transactions || []);

      } catch (error) {
        console.error("Recent Transactions Error:", error);
        setTransactionsError("Unable to load transactions.");

      } finally {
        setTransactionsLoading(false);
      }
    };

    fetchRecentTransactions();
  }, []);

  // FETCH AI-GENERATED DASHBOARD INSIGHTS
  useEffect(() => {
    const fetchDashboardInsights = async () => {
      try {
        setInsightsLoading(true);
        setInsightsError("");

        const response = await getDashboardInsights();

        if (!response.success) {
          throw new Error("Unable to generate AI insights.");
        }

        setAiInsights(response.insights || []);

      } catch (error) {
        console.error("Dashboard AI Insights Error:", error);

        setInsightsError(
          error.response?.status === 429
            ? "AI quota reached. Please try again later."
            : "Unable to generate AI insights right now."
        );

      } finally {
        setInsightsLoading(false);
      }
    };

    fetchDashboardInsights();
  }, [insightsRefreshKey]);

  // FORMAT USD CURRENCY
  const money = (amount) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD"
    }).format(amount);

  // GET REAL FINANCIAL TOTALS
  const usdAnalytics = analytics?.totalsByCurrency?.USD;

  const totalRevenue = usdAnalytics?.totalRevenue ?? 0;
  const successfulPayments = usdAnalytics?.totalPayments ?? 0;

  // GET REAL PENDING AND OVERDUE TOTALS
  const outstandingAnalytics =
    analytics?.outstandingByCurrency?.USD || {};

  const pendingAmount = outstandingAnalytics.pendingAmount ?? 0;
  const pendingCount = outstandingAnalytics.pendingCount ?? 0;

  const overdueAmount = outstandingAnalytics.overdueAmount ?? 0;
  const overdueCount = outstandingAnalytics.overdueCount ?? 0;

  // PREPARE REAL MONTHLY REVENUE DATA
  const chartData =
    analytics?.monthlyRevenue?.map((item) => ({
      month: item.label,
      revenue: item.currencies?.USD?.revenue || 0
    })) || [];

  // FORMAT REAL TRANSACTIONS FOR DASHBOARD
  const dashboardTransactions = recentTransactions.map(
    (transaction) => ({
      id: transaction.invoiceNumber,
      name: transaction.customerName,
      date: transaction.paidAt
        ? new Date(transaction.paidAt).toLocaleDateString(
            "en-US",
            {
              month: "short",
              day: "numeric",
              year: "numeric"
            }
          )
        : "Date unavailable",
      amount: transaction.amount,
      currency: transaction.currency,
      status: transaction.status
    })
  );

  return (
    <div className="app">

      {/* SIDEBAR */}
      <aside className="sidebar">

        <div className="logo">
          <div className="logo-icon">
            <Sparkles size={22} />
          </div>

          <span>
            PayPilot <b>AI</b>
          </span>
        </div>

        <p className="menu-label">
          WORKSPACE
        </p>

        <nav>
          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.name}
                className={`nav-item ${
                  activePage === item.name
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  setActivePage(item.name)
                }
              >
                <Icon size={19} />
                {item.name}
              </button>
            );
          })}
        </nav>

        <div className="sidebar-bottom">

          <div className="ai-promo">

            <Sparkles size={22} />

            <h3>
              Your AI Copilot
            </h3>

            <p>
              Smarter insights for better
              financial decisions.
            </p>

            <button
              onClick={() =>
                setActivePage("AI Assistant")
              }
            >
              Explore AI
              <ArrowUpRight size={15} />
            </button>

          </div>

          <div className="profile">

            <div className="avatar">
              P
            </div>

            <div>
              <strong>
                PayPilot Workspace
              </strong>

              <small>
                Demo Account
              </small>
            </div>

          </div>

        </div>

      </aside>

      {/* MAIN CONTENT */}
      <main className="main">

        {/* TOP HEADER */}
        <header className="topbar">

          <div>

            <p className="eyebrow">
              FINANCIAL OVERVIEW
            </p>

            <h1>
              {activePage}
            </h1>

            <p className="subtitle">
              Welcome to your intelligent
              payment workspace.
            </p>

          </div>

          <div className="top-actions">

            <button
              className="icon-button"
              aria-label="Notifications"
            >
              <Bell size={20} />
            </button>

            <div className="avatar">
              P
            </div>

          </div>

        </header>

        {/* PAGE ROUTING */}

        {activePage === "Invoices" ? (

          <InvoicePage />

        ) : activePage === "AI Payment Reminders" ? (

          <InvoiceRemindersPage />

        ) : activePage === "Dashboard" ? (

          <>

            {/* WELCOME BANNER */}
            <div className="welcome-banner">

              <div>

                <span className="banner-tag">
                  <Sparkles size={14} />
                  POWERED BY AI
                </span>

                <h2>
                  Your finances, on autopilot.
                </h2>

                <p>
                  Track payments, uncover insights,
                  and make smarter decisions with
                  PayPilot AI.
                </p>

                <button
                  onClick={() =>
                    setActivePage("AI Assistant")
                  }
                >
                  Explore AI Assistant
                  <ArrowUpRight size={17} />
                </button>

              </div>

              <div className="banner-art">
                <BrainCircuit size={95} />
              </div>

            </div>

            {/* STATISTICS */}
            <div className="stats-grid">

              <StatCard
                title="Total Revenue"
                value={
                  analyticsLoading
                    ? "Loading..."
                    : analyticsError
                      ? "Unavailable"
                      : money(totalRevenue)
                }
                change="Actual PayPal revenue"
                icon={Wallet}
                positive
              />

              <StatCard
                title="Successful Payments"
                value={
                  analyticsLoading
                    ? "Loading..."
                    : analyticsError
                      ? "Unavailable"
                      : successfulPayments.toString()
                }
                change="Verified PayPal captures"
                icon={CheckCircle2}
                positive
              />

              <StatCard
                title="Pending Payments"
                value={
                  analyticsLoading
                    ? "Loading..."
                    : analyticsError
                      ? "Unavailable"
                      : money(pendingAmount)
                }
                change={`${pendingCount} invoices`}
                icon={Clock}
              />

              <StatCard
                title="Overdue Amount"
                value={
                  analyticsLoading
                    ? "Loading..."
                    : analyticsError
                      ? "Unavailable"
                      : money(overdueAmount)
                }
                change={`${overdueCount} overdue invoices`}
                icon={CreditCard}
              />

            </div>

            {/* CHART AND AI INSIGHTS */}
            <div className="content-grid">

              {/* REVENUE CHART */}
              <section className="panel chart-panel">

                <div className="panel-header">

                  <div>

                    <h3>
                      Revenue Analytics
                    </h3>

                    <p>
                      Monthly revenue performance
                    </p>

                  </div>

                  <span className="period">
                    Last 12 months
                  </span>

                </div>

                <div className="chart">

                  {analyticsLoading ? (

                    <p>
                      Loading monthly revenue...
                    </p>

                  ) : analyticsError ? (

                    <p>
                      {analyticsError}
                    </p>

                  ) : (

                    <ResponsiveContainer
                      width="100%"
                      height="100%"
                    >

                      <AreaChart
                        data={chartData}
                      >

                        <defs>

                          <linearGradient
                            id="revenueGradient"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >

                            <stop
                              offset="0%"
                              stopColor="#8b5cf6"
                              stopOpacity={0.35}
                            />

                            <stop
                              offset="95%"
                              stopColor="#8b5cf6"
                              stopOpacity={0}
                            />

                          </linearGradient>

                        </defs>

                        <CartesianGrid
                          stroke="#26283c"
                          vertical={false}
                        />

                        <XAxis
                          dataKey="month"
                          stroke="#9395ad"
                          tickLine={false}
                          axisLine={false}
                        />

                        <YAxis
                          stroke="#9395ad"
                          tickLine={false}
                          axisLine={false}
                          tickFormatter={(v) =>
                            `$${v.toLocaleString(
                              "en-US"
                            )}`
                          }
                        />

                        <Tooltip
                          contentStyle={{
                            background: "#1b1d30",
                            border: "1px solid #35364c",
                            borderRadius: 12
                          }}
                          formatter={(v) =>
                            money(v)
                          }
                        />

                        <Area
                          type="monotone"
                          dataKey="revenue"
                          stroke="#a78bfa"
                          strokeWidth={3}
                          fill="url(#revenueGradient)"
                        />

                      </AreaChart>

                    </ResponsiveContainer>

                  )}

                </div>

              </section>

              {/* AI INSIGHTS */}
              <section className="panel insights-panel">

                <div className="panel-header">

                  <div>

                    <h3>
                      <Sparkles size={18} />
                      AI Insights
                    </h3>

                    <p>
                      Gemini-powered financial
                      observations
                    </p>

                  </div>

                  <button
                    className="secondary-button"
                    onClick={() =>
                      setInsightsRefreshKey(
                        (prev) => prev + 1
                      )
                    }
                    disabled={insightsLoading}
                  >
                    <Sparkles size={14} />

                    {insightsLoading
                      ? "Refreshing..."
                      : "Refresh"}

                  </button>

                </div>

                {insightsLoading ? (

                  <div className="insight">

                    <div className="insight-icon purple">
                      <Sparkles size={20} />
                    </div>

                    <div>

                      <strong>
                        Analyzing your finances...
                      </strong>

                      <p>
                        PayPilot AI is generating
                        your financial insights.
                      </p>

                    </div>

                  </div>

                ) : insightsError ? (

                  <div className="insight">

                    <div className="insight-icon orange">
                      <Clock size={20} />
                    </div>

                    <div>

                      <strong>
                        Insights temporarily unavailable
                      </strong>

                      <p>
                        {insightsError}
                      </p>

                    </div>

                  </div>

                ) : aiInsights.length > 0 ? (

                  aiInsights.map(
                    (insight, index) => (

                      <div
                        className="insight"
                        key={index}
                      >

                        <div
                          className={`insight-icon ${
                            insight.type === "warning"
                              ? "orange"
                              : insight.type === "success"
                                ? "green"
                                : "purple"
                          }`}
                        >

                          {insight.type === "warning" ? (

                            <Clock size={20} />

                          ) : insight.type === "success" ? (

                            <CheckCircle2 size={20} />

                          ) : (

                            <ArrowUpRight size={20} />

                          )}

                        </div>

                        <div>

                          <strong>
                            {insight.title}
                          </strong>

                          <p>
                            {insight.description}
                          </p>

                        </div>

                      </div>

                    )
                  )

                ) : (

                  <div className="insight">

                    <div className="insight-icon orange">
                      <Clock size={20} />
                    </div>

                    <div>

                      <strong>
                        No insights available
                      </strong>

                      <p>
                        There are no AI-generated
                        insights to display yet.
                      </p>

                    </div>

                  </div>

                )}

                <button
                  className="text-button"
                  onClick={() =>
                    setActivePage("AI Assistant")
                  }
                >
                  Open AI Assistant
                  <ArrowUpRight size={16} />
                </button>

              </section>

            </div>

            {/* RECENT TRANSACTIONS */}
            <section className="panel transactions-panel">

              <div className="panel-header">

                <div>

                  <h3>
                    Recent Transactions
                  </h3>

                  <p>
                    Keep track of your latest payments
                  </p>

                </div>

                <button
                  className="secondary-button"
                  onClick={() =>
                    setActivePage("Transactions")
                  }
                >
                  View all
                  <ArrowUpRight size={16} />
                </button>

              </div>

              {transactionsLoading ? (

                <p>
                  Loading transactions...
                </p>

              ) : transactionsError ? (

                <p>
                  {transactionsError}
                </p>

              ) : (

                <TransactionTable
                  data={dashboardTransactions}
                  money={money}
                />

              )}

            </section>

          </>

        ) : activePage === "Transactions" ? (

          <TransactionsPage />

        ) : activePage === "AI Assistant" ? (

          <AIAssistantPage />

        ) : (

          /* SETTINGS PAGE */
          <section className="settings-page">

            <div className="settings-header">

              <div>

                <span className="settings-eyebrow">
                  WORKSPACE SETTINGS
                </span>

                <h2>
                    Workspace Configuration
                </h2>

                <p>
                  Manage your PayPilot AI workspace
                  and connected services.
                </p>

              </div>

            </div>

            <div className="settings-grid">

              {/* WORKSPACE */}
              <section className="panel settings-card">

                <div className="settings-card-header">

                  <div className="settings-icon">
                    <Settings size={20} />
                  </div>

                  <div>

                    <h3>
                      Workspace
                    </h3>

                    <p>
                      Your PayPilot AI workspace
                      configuration.
                    </p>

                  </div>

                </div>

                <div className="settings-list">

                  <div className="settings-row">

                    <div>

                      <strong>
                        Workspace Name
                      </strong>

                      <span>
                        Primary workspace for your
                        payment operations.
                      </span>

                    </div>

                    <div className="settings-value">
                      PayPilot AI
                    </div>

                  </div>

                  <div className="settings-row">

                    <div>

                      <strong>
                        Default Currency
                      </strong>

                      <span>
                        Currency used for the
                        payment workspace.
                      </span>

                    </div>

                    <div className="settings-value">
                      USD ($)
                    </div>

                  </div>

                  <div className="settings-row">

                    <div>

                      <strong>
                        Environment
                      </strong>

                      <span>
                        Current PayPal environment.
                      </span>

                    </div>

                    <div className="settings-status active">

                      <span className="status-dot"></span>

                      Sandbox Active

                    </div>

                  </div>

                </div>

              </section>

              {/* CONNECTED SERVICES */}
              <section className="panel settings-card">

                <div className="settings-card-header">

                  <div className="settings-icon">
                    <CreditCard size={20} />
                  </div>

                  <div>

                    <h3>
                      Connected Services
                    </h3>

                    <p>
                      Services powering your
                      PayPilot AI workspace.
                    </p>

                  </div>

                </div>

                <div className="settings-list">

                  <div className="settings-row">

                    <div>

                      <strong>
                        PayPal
                      </strong>

                      <span>
                        Payment processing and
                        sandbox transactions.
                      </span>

                    </div>

                    <div className="settings-status active">

                      <span className="status-dot"></span>

                      Connected

                    </div>

                  </div>

                  <div className="settings-row">

                    <div>

                      <strong>
                        Gemini AI
                      </strong>

                      <span>
                        AI-powered financial insights
                        and assistance.
                      </span>

                    </div>

                    <div className="settings-status active">

                      <span className="status-dot"></span>

                      Connected

                    </div>

                  </div>

                  <div className="settings-row">

                    <div>

                      <strong>
                        Resend
                      </strong>

                      <span>
                        Payment reminder email
                        delivery service.
                      </span>

                    </div>

                    <div className="settings-status active">

                      <span className="status-dot"></span>

                      Connected

                    </div>

                  </div>

                </div>

              </section>

            </div>

            {/* ABOUT */}
            <section className="panel settings-about">

              <div className="settings-about-icon">
                <Sparkles size={25} />
              </div>

              <div>

                <span className="settings-eyebrow">
                  ABOUT PAYPILOT AI
                </span>

                <h3>
                  Smarter payment operations with AI.
                </h3>

                <p>
                  PayPilot AI combines payment
                  tracking, invoice management,
                  AI-powered financial insights,
                  and intelligent payment reminders
                  in one workspace.
                </p>

                

              </div>

            </section>

            <button
              className="secondary-button settings-back-button"
              onClick={() =>
                setActivePage("Dashboard")
              }
            >
              Back to Dashboard
            </button>

          </section>

        )}

        <footer>
          PayPilot AI © 2026        </footer>

      </main>

    </div>
  );
}

// STAT CARD COMPONENT
function StatCard({
  title,
  value,
  change,
  icon: Icon,
  positive
}) {

  return (
    <div className="stat-card">

      <div className="stat-top">

        <span>
          {title}
        </span>

        <div className="stat-icon">
          <Icon size={20} />
        </div>

      </div>

      <h2>
        {value}
      </h2>

      <div
        className={`stat-change ${
          positive ? "positive" : ""
        }`}
      >

        {positive ? (
          <ArrowUpRight size={15} />
        ) : (
          <ArrowDownRight size={15} />
        )}

        {change}

      </div>

    </div>
  );
}

// TRANSACTION TABLE COMPONENT
function TransactionTable({
  data,
  money
}) {

  return (
    <div className="table-scroll">

      <table>

        <thead>

          <tr>

            <th>
              TRANSACTION
            </th>

            <th>
              DATE
            </th>

            <th>
              AMOUNT
            </th>

            <th>
              STATUS
            </th>

          </tr>

        </thead>

        <tbody>

          {data.map((t) => (

            <tr key={t.id}>

              <td>

                <div className="transaction-name">

                  <div className="transaction-avatar">
                    {t.name.charAt(0)}
                  </div>

                  <div>

                    <strong>
                      {t.name}
                    </strong>

                    <small>
                      {t.id}
                    </small>

                  </div>

                </div>

              </td>

              <td>
                {t.date}
              </td>

              <td className="amount">
                {money(t.amount)}
              </td>

              <td>

                <span
                  className={`status ${
                    t.status.toLowerCase()
                  }`}
                >
                  {t.status}
                </span>

              </td>

            </tr>

          ))}

          {data.length === 0 && (

            <tr>

              <td colSpan="4">
                No completed transactions found.
              </td>

            </tr>

          )}

        </tbody>

      </table>

    </div>
  );
}

// MAIN APP COMPONENT
function App() {

  return (

    <PayPalScriptProvider
      options={{
        clientId:
          import.meta.env.VITE_PAYPAL_CLIENT_ID,
        currency: "USD",
        intent: "capture",
        buyerCountry: "US"
      }}
    >

      <DashboardApp />

    </PayPalScriptProvider>

  );
}

export default App;