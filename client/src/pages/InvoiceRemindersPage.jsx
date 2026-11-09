import { useEffect, useState } from "react";
import {
  getOverdueInvoices,
  generateInvoiceReminder,
  sendInvoiceReminderEmail
} from "../services/api";

const InvoiceRemindersPage = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generatingId, setGeneratingId] = useState(null);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState("");

  const [reminder, setReminder] = useState(null);
  const [editedSubject, setEditedSubject] = useState("");
  const [editedMessage, setEditedMessage] = useState("");
  const [copied, setCopied] = useState(false);

  // FETCH OVERDUE INVOICES
  const fetchOverdueInvoices = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getOverdueInvoices();

      if (!response.success) {
        throw new Error("Unable to fetch overdue invoices.");
      }

      setInvoices(response.invoices || []);

    } catch (error) {
      console.error("Overdue Invoice Error:", error);

      setError(
        error.response?.data?.message ||
        "Unable to load overdue invoices."
      );

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverdueInvoices();
  }, []);

  // GENERATE AI REMINDER
  const handleGenerateReminder = async (invoiceId) => {
    try {
      setGeneratingId(invoiceId);
      setError("");
      setCopied(false);
      setEmailSent(false);
      setReminder(null);

      const response = await generateInvoiceReminder(invoiceId);

      if (!response.success) {
        throw new Error(
          response.message ||
          "Unable to generate reminder."
        );
      }

      setReminder(response);
      setEditedSubject(response.subject);
      setEditedMessage(response.message);

    } catch (error) {
      console.error(
        "Generate Reminder Error:",
        error
      );

      setError(
        error.response?.data?.message ||
        error.message ||
        "Unable to generate AI reminder."
      );

    } finally {
      setGeneratingId(null);
    }
  };

  // SEND REMINDER EMAIL
  const handleSendEmail = async () => {
    if (!reminder) return;

    try {
      setSendingEmail(true);
      setError("");
      setEmailSent(false);

      const response = await sendInvoiceReminderEmail(
        reminder.invoiceId,
        {
          subject: editedSubject,
          message: editedMessage
        }
      );

      if (!response.success) {
        throw new Error(
          response.message ||
          "Unable to send reminder email."
        );
      }

      setEmailSent(true);

    } catch (error) {
      console.error(
        "Send Reminder Email Error:",
        error
      );

      setError(
        error.response?.data?.message ||
        error.message ||
        "Unable to send reminder email."
      );

    } finally {
      setSendingEmail(false);
    }
  };

  // COPY REMINDER
  const handleCopyReminder = async () => {
    try {
      const textToCopy =
        `Subject: ${editedSubject}\n\n${editedMessage}`;

      await navigator.clipboard.writeText(
        textToCopy
      );

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);

    } catch (error) {
      console.error(
        "Copy Reminder Error:",
        error
      );

      setError(
        "Unable to copy the reminder."
      );
    }
  };

  // FORMAT DATE
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString(
      "en-US",
      {
        year: "numeric",
        month: "short",
        day: "numeric"
      }
    );
  };

  // CALCULATE DAYS OVERDUE
  const getDaysOverdue = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);

    const difference =
      today.getTime() -
      due.getTime();

    return Math.floor(
      difference /
      (1000 * 60 * 60 * 24)
    );
  };

  return (
    <div className="page-container">

      {/* PAGE HEADER */}
      <div className="page-header">

        <div>
          <h1>
            AI Payment Reminders
          </h1>

          <p>
            Generate personalized payment
            reminders for overdue invoices.
          </p>
        </div>

        <button
          className="secondary-button"
          onClick={fetchOverdueInvoices}
          disabled={loading}
        >
          {loading
            ? "Refreshing..."
            : "Refresh"}
        </button>

      </div>

      {/* ERROR */}
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* LOADING */}
      {loading ? (

        <div className="empty-state">
          Loading overdue invoices...
        </div>

      ) : invoices.length === 0 ? (

        <div className="empty-state">

          <h3>
            No overdue invoices
          </h3>

          <p>
            You currently don't have any
            unpaid overdue invoices that need
            a payment reminder.
          </p>

        </div>

      ) : (

        <div className="reminder-layout">

          {/* OVERDUE INVOICES */}
          <div className="card">

            <div className="card-header">

              <div>

                <h2>
                  Overdue Invoices
                </h2>

                <p>
                  {invoices.length} invoice
                  {invoices.length !== 1
                    ? "s"
                    : ""}{" "}
                  need
                  {invoices.length === 1
                    ? "s"
                    : ""}{" "}
                  attention.
                </p>

              </div>

            </div>

            <div className="invoice-reminder-list">

              {invoices.map((invoice) => (

                <div
                  key={invoice._id}
                  className="reminder-invoice-card"
                >

                  {/* INVOICE INFO */}
                  <div className="invoice-reminder-info">

                    <div>

                      <h3>
                        {invoice.invoiceNumber}
                      </h3>

                      <p>
                        {invoice.customerName}
                      </p>

                    </div>

                    <div className="invoice-reminder-amount">

                      {invoice.currency}{" "}
                      {invoice.amount.toLocaleString()}

                    </div>

                  </div>

                  {/* DUE DATE */}
                  <div className="invoice-reminder-details">

                    <span>
                      Due:{" "}
                      {formatDate(
                        invoice.dueDate
                      )}
                    </span>

                    <span>
                      {getDaysOverdue(
                        invoice.dueDate
                      )}{" "}
                      days overdue
                    </span>

                  </div>

                  {/* FEE DETAILS */}
                  <div className="invoice-reminder-fee-details">

                    <div>

                      <span>
                        Original Amount
                      </span>

                      <strong>
                        {invoice.currency}{" "}
                        {invoice.amount.toFixed(2)}
                      </strong>

                    </div>

                    <div>

                      <span>
                        Late Payment Fee (
                        {invoice.lateFeePercentage}
                        %)
                      </span>

                      <strong>
                        {invoice.currency}{" "}
                        {invoice.lateFeeAmount.toFixed(2)}
                      </strong>

                    </div>

                    <div>

                      <span>
                        Total Outstanding
                      </span>

                      <strong>
                        {invoice.currency}{" "}
                        {invoice.totalOutstanding.toFixed(2)}
                      </strong>

                    </div>

                  </div>

                  {/* GENERATE BUTTON */}
                  <button
                    className="primary-button"
                    onClick={() =>
                      handleGenerateReminder(
                        invoice._id
                      )
                    }
                    disabled={
                      generatingId ===
                      invoice._id
                    }
                  >
                    {generatingId ===
                    invoice._id
                      ? "Generating..."
                      : "✨ Generate AI Reminder"}
                  </button>

                </div>

              ))}

            </div>

          </div>

          {/* AI REMINDER PREVIEW */}
          {reminder && (

            <div className="card reminder-preview-card">

              <div className="card-header">

                <div>

                  <h2>
                    AI Reminder Preview
                  </h2>

                  <p>
                    Review and edit the
                    message before sending it.
                  </p>

                </div>

              </div>

              {/* SUBJECT */}
              <div className="form-group">

                <label>
                  Subject
                </label>

                <input
                  type="text"
                  value={editedSubject}
                  onChange={(e) =>
                    setEditedSubject(
                      e.target.value
                    )
                  }
                  className="form-input"
                />

              </div>

              {/* MESSAGE */}
              <div className="form-group">

                <label>
                  Message
                </label>

                <textarea
                  value={editedMessage}
                  onChange={(e) =>
                    setEditedMessage(
                      e.target.value
                    )
                  }
                  className="form-textarea"
                  rows={12}
                />

              </div>

              {/* ACTIONS */}
              <div className="reminder-actions">

                {/* COPY */}
                <button
                  className="primary-button"
                  onClick={
                    handleCopyReminder
                  }
                >
                  {copied
                    ? "✓ Copied!"
                    : "Copy Reminder"}
                </button>

                {/* SEND EMAIL */}
                <button
                  className="send-reminder-email-btn"
                  onClick={
                    handleSendEmail
                  }
                  disabled={
                    sendingEmail ||
                    emailSent
                  }
                >
                  {sendingEmail
                    ? "Sending..."
                    : emailSent
                      ? "✓ Email Sent"
                      : "📧 Send Reminder Email"}
                </button>

              </div>

              {/* SUCCESS MESSAGE */}
              {emailSent && (
                <div className="email-success-message">
                  Payment reminder email sent
                  successfully.
                </div>
              )}

              {/* NOTE */}
              <span className="manual-send-note">
                You can edit the AI-generated
                message before sending it.
              </span>

            </div>

          )}

        </div>

      )}

    </div>
  );
};

export default InvoiceRemindersPage;