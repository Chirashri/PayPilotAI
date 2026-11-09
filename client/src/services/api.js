import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json"
  }
});

// GET ALL INVOICES
export const getInvoices = async () => {
  const response = await api.get("/invoices");
  return response.data.invoices;
};

// CREATE INVOICE
export const createInvoice = async (invoiceData) => {
  const response = await api.post("/invoices", invoiceData);
  return response.data;
};

// UPDATE INVOICE
export const updateInvoice = async (id, invoiceData) => {
  const response = await api.put(`/invoices/${id}`, invoiceData);
  return response.data;
};

// DELETE INVOICE
export const deleteInvoice = async (id) => {
  const response = await api.delete(`/invoices/${id}`);
  return response.data;
};

// CREATE PAYPAL ORDER
export const createPayPalOrder = async (invoiceId) => {
  const response = await api.post(
    `/paypal/create-order/${invoiceId}`
  );

  return response.data;
};

// GET TRANSACTIONS
export const getTransactions = async () => {
  const response = await api.get("/transactions");
  return response.data;
};

// CAPTURE PAYPAL PAYMENT
export const capturePayPalOrder = async (orderID) => {
  const response = await api.post(
    "/paypal/capture-order",
    { orderID }
  );

  return response.data;
};

// ASK PAYPILOT AI WITH CONVERSATION HISTORY
export const askFinancialAI = async (question, history = []) => {
  const response = await api.post("/ai/ask", {
    question,
    history
  });

  return response.data;
};

// GET MONTHLY REVENUE ANALYTICS
export const getMonthlyAnalytics = async () => {
  const response = await api.get("/analytics/monthly");
  return response.data;
};

// GET AI-GENERATED DASHBOARD INSIGHTS
export const getDashboardInsights = async () => {
  const response = await api.get("/ai/insights");
  return response.data;
};

// GET OVERDUE INVOICES
export const getOverdueInvoices = async () => {
  const response = await api.get("/reminders/overdue");
  return response.data;
};

// GENERATE AI PAYMENT REMINDER
export const generateInvoiceReminder = async (invoiceId) => {
  const response = await api.post(
    `/reminders/generate/${invoiceId}`
  );

  return response.data;
};

// SEND PAYMENT REMINDER EMAIL
// Sends the edited subject and message from the frontend
export const sendInvoiceReminderEmail = async (
  invoiceId,
  emailData
) => {
  const response = await api.post(
    `/reminders/send/${invoiceId}`,
    emailData
  );

  return response.data;
};

export default api;