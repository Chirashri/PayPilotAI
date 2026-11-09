
import { useEffect, useState } from "react";
import {
  Search,
  RefreshCw,
  ArrowDownToLine,
  Receipt,
  CreditCard,
  CircleCheck,
  DollarSign,
  CalendarDays,
  Eye,
  X
} from "lucide-react";

import { getTransactions } from "./services/api";

function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  const money = (amount, currency = "USD") =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency
    }).format(amount || 0);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      setError("");

      const result = await getTransactions();

      setTransactions(result.transactions || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to load transactions. Please check your backend."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  const filteredTransactions = transactions.filter((transaction) => {
    const searchText = [
      transaction.invoiceNumber,
      transaction.customerName,
      transaction.customerEmail,
      transaction.paypalCaptureId,
      transaction.paypalOrderId
    ]
      .join(" ")
      .toLowerCase();

    return searchText.includes(search.toLowerCase());
  });

  const totalRevenue = transactions.reduce(
    (total, transaction) => total + transaction.amount,
    0
  );

  const totalTransactions = transactions.length;

  const latestTransaction = transactions.length
    ? [...transactions].sort(
        (a, b) => new Date(b.paidAt) - new Date(a.paidAt)
      )[0]
    : null;

  const exportTransactions = () => {
    if (!filteredTransactions.length) return;

    const headers = [
      "Invoice Number",
      "Customer",
      "Email",
      "Description",
      "Amount",
      "Currency",
      "Status",
      "PayPal Order ID",
      "PayPal Capture ID",
      "Paid At"
    ];

    const rows = filteredTransactions.map((transaction) => [
      transaction.invoiceNumber,
      transaction.customerName,
      transaction.customerEmail,
      transaction.description,
      transaction.amount,
      transaction.currency,
      transaction.status,
      transaction.paypalOrderId,
      transaction.paypalCaptureId,
      transaction.paidAt
    ]);

    const csvContent = [headers, ...rows]
      .map((row) =>
        row
          .map((value) =>
            `"${String(value ?? "").replace(/"/g, '""')}"`
          )
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;"
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "paypilot-transactions.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="invoice-page">

      <div className="invoice-heading">
        <div>
          <span className="invoice-eyebrow">
            PAYMENT MANAGEMENT
          </span>
          <h2>Transactions</h2>
          <p>
            Track and manage your completed PayPal payments.
          </p>
        </div>

        <div className="invoice-heading-actions">
          <button
            className="invoice-refresh"
            onClick={loadTransactions}
            disabled={loading}
            aria-label="Refresh transactions"
          >
            <RefreshCw size={17} />
          </button>

          <button
            className="invoice-add"
            onClick={exportTransactions}
            disabled={!filteredTransactions.length}
          >
            <ArrowDownToLine size={17} />
            Export CSV
          </button>
        </div>
      </div>

      <div className="invoice-stats">

        <div className="invoice-stat">
          <span>Total Revenue</span>
          <h3>{money(totalRevenue)}</h3>
          <small className="invoice-green">
            From completed payments
          </small>
        </div>

        <div className="invoice-stat">
          <span>Total Transactions</span>
          <h3>{totalTransactions}</h3>
          <small>
            Successful payments
          </small>
        </div>

        <div className="invoice-stat">
          <span>Average Payment</span>
          <h3>
            {money(
              totalTransactions
                ? totalRevenue / totalTransactions
                : 0
            )}
          </h3>
          <small>
            Average transaction value
          </small>
        </div>

        <div className="invoice-stat">
          <span>Latest Payment</span>
          <h3>
            {latestTransaction
              ? money(
                  latestTransaction.amount,
                  latestTransaction.currency
                )
              : money(0)}
          </h3>
          <small>
            {latestTransaction
              ? new Date(latestTransaction.paidAt).toLocaleDateString(
                  "en-US",
                  {
                    day: "numeric",
                    month: "short",
                    year: "numeric"
                  }
                )
              : "No payments yet"}
          </small>
        </div>

      </div>

      <section className="panel invoice-table-panel">

        <div className="invoice-toolbar">
          <div>
            <h3>Payment History</h3>
            <p>
              Your completed PayPal transactions
            </p>
          </div>

          <div className="invoice-search">
            <Search size={17} />
            <input
              placeholder="Search transactions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {error && (
          <div className="invoice-error">
            {error}
          </div>
        )}

        {loading ? (
          <div className="invoice-empty">
            Loading transactions...
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="invoice-empty">
            <Receipt size={38} />
            <h3>No transactions found</h3>
            <p>
              Your completed payments will appear here.
            </p>
          </div>
        ) : (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>TRANSACTION</th>
                  <th>CUSTOMER</th>
                  <th>AMOUNT</th>
                  <th>PAYMENT DATE</th>
                  <th>STATUS</th>
                  <th>ACTION</th>
                </tr>
              </thead>

              <tbody>
                {filteredTransactions.map((transaction) => (
                  <tr key={transaction._id}>
                    <td>
                      <strong className="invoice-number">
                        {transaction.invoiceNumber}
                      </strong>

                      <small className="invoice-description">
                        {transaction.paypalCaptureId}
                      </small>
                    </td>

                    <td>
                      <strong>
                        {transaction.customerName}
                      </strong>

                      <small className="invoice-description">
                        {transaction.customerEmail}
                      </small>
                    </td>

                    <td className="amount">
                      {money(
                        transaction.amount,
                        transaction.currency
                      )}
                    </td>

                    <td>
                      <span className="invoice-date">
                        <CalendarDays size={14} />

                        {transaction.paidAt
                          ? new Date(
                              transaction.paidAt
                            ).toLocaleDateString("en-US", {
                              day: "numeric",
                              month: "short",
                              year: "numeric"
                            })
                          : "N/A"}
                      </span>
                    </td>

                    <td>
                      <span className="status paid">
                        {transaction.status}
                      </span>
                    </td>

                    <td>
                      <div className="invoice-actions">
                        <button
                          title="View transaction"
                          aria-label="View transaction"
                          onClick={() =>
                            setSelectedTransaction(transaction)
                          }
                        >
                          <Eye size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="invoice-footer">
          Showing {filteredTransactions.length} of{" "}
          {transactions.length} transactions
        </div>

      </section>

      {selectedTransaction && (
        <div
          className="invoice-modal-overlay"
          onClick={() => setSelectedTransaction(null)}
        >
          <div
            className="invoice-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="invoice-modal-header">
              <div>
                <h2>Transaction Details</h2>
                <p>
                  Completed PayPal payment information.
                </p>
              </div>

              <button
                onClick={() => setSelectedTransaction(null)}
                aria-label="Close details"
              >
                <X size={20} />
              </button>
            </div>

            <div className="transaction-details">

              <div className="transaction-detail-highlight">
                <CircleCheck size={24} />
                <div>
                  <strong>Payment Successful</strong>
                  <h2>
                    {money(
                      selectedTransaction.amount,
                      selectedTransaction.currency
                    )}
                  </h2>
                </div>
              </div>

              <div className="transaction-detail-row">
                <span>Invoice Number</span>
                <strong>
                  {selectedTransaction.invoiceNumber}
                </strong>
              </div>

              <div className="transaction-detail-row">
                <span>Customer</span>
                <strong>
                  {selectedTransaction.customerName}
                </strong>
              </div>

              <div className="transaction-detail-row">
                <span>Email</span>
                <strong>
                  {selectedTransaction.customerEmail}
                </strong>
              </div>

              <div className="transaction-detail-row">
                <span>Description</span>
                <strong>
                  {selectedTransaction.description}
                </strong>
              </div>

              <div className="transaction-detail-row">
                <span>Payment Status</span>
                <strong>
                  {selectedTransaction.status}
                </strong>
              </div>

              <div className="transaction-detail-row">
                <span>PayPal Order ID</span>
                <strong>
                  {selectedTransaction.paypalOrderId || "N/A"}
                </strong>
              </div>

              <div className="transaction-detail-row">
                <span>PayPal Capture ID</span>
                <strong>
                  {selectedTransaction.paypalCaptureId || "N/A"}
                </strong>
              </div>

              <div className="transaction-detail-row">
                <span>Paid At</span>
                <strong>
                  {selectedTransaction.paidAt
                    ? new Date(
                        selectedTransaction.paidAt
                      ).toLocaleString()
                    : "N/A"}
                </strong>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default TransactionsPage;
