import { useEffect, useState } from "react";
import {
  Plus, Search, Pencil, Trash2, X,
  FileText, RefreshCw, CalendarDays
} from "lucide-react";

import { PayPalButtons } from "@paypal/react-paypal-js";
import {
  getInvoices,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  createPayPalOrder,
  capturePayPalOrder
} from "./services/api";

function InvoicePage() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const emptyForm = {
    customerName: "",
    customerEmail: "",
    description: "",
    amount: "",
    dueDate: ""
  };

  const [form, setForm] = useState(emptyForm);

  const money = (amount) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD"
    }).format(amount);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getInvoices();

      setInvoices(data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to load invoices. Check your backend server."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvoices();
  }, []);

  const openCreateForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEditForm = (invoice) => {
    // PAID INVOICES CANNOT BE EDITED
    if (invoice.status === "Paid") {
      setError("Paid invoices cannot be edited.");
      return;
    }

    setEditingId(invoice._id);

    setForm({
      customerName: invoice.customerName,
      customerEmail: invoice.customerEmail,
      description: invoice.description,
      amount: invoice.amount,
      dueDate: new Date(invoice.dueDate)
        .toISOString()
        .slice(0, 10)
    });

    setShowForm(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (Number(form.amount) <= 0) {
      setError("Enter an amount greater than zero.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const invoiceData = {
        ...form,
        amount: Number(form.amount)
      };

      if (editingId) {
        await updateInvoice(editingId, invoiceData);
      } else {
        await createInvoice(invoiceData);
      }

      setShowForm(false);
      setForm(emptyForm);
      setEditingId(null);

      await loadInvoices();

    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to save invoice. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this invoice?"
    );

    if (!confirmed) return;

    try {
      setError("");

      await deleteInvoice(id);

      await loadInvoices();

    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to delete invoice."
      );
    }
  };

  const getStatus = (invoice) => {
    if (invoice.status === "Paid") {
      return "Paid";
    }

    if (
      invoice.status === "Pending" &&
      new Date(invoice.dueDate) < new Date(
        new Date().toDateString()
      )
    ) {
      return "Overdue";
    }

    return invoice.status;
  };

  const filteredInvoices = invoices.filter((invoice) => {
    const status = getStatus(invoice);

    const matchesSearch = [
      invoice.invoiceNumber,
      invoice.customerName,
      invoice.customerEmail,
      invoice.description
    ]
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesFilter =
      filter === "All" || status === filter;

    return matchesSearch && matchesFilter;
  });

  const totalAmount = invoices.reduce(
    (sum, invoice) =>
      sum + invoice.amount,
    0
  );

  const paidAmount = invoices
    .filter(
      (invoice) =>
        getStatus(invoice) === "Paid"
    )
    .reduce(
      (sum, invoice) =>
        sum + invoice.amount,
      0
    );

  const pendingAmount = invoices
    .filter(
      (invoice) =>
        getStatus(invoice) === "Pending"
    )
    .reduce(
      (sum, invoice) =>
        sum + invoice.amount,
      0
    );

  const overdueAmount = invoices
    .filter(
      (invoice) =>
        getStatus(invoice) === "Overdue"
    )
    .reduce(
      (sum, invoice) =>
        sum + invoice.amount,
      0
    );

  return (
    <div className="invoice-page">

      <div className="invoice-heading">

        <div>
          <span className="invoice-eyebrow">
            PAYMENT MANAGEMENT
          </span>

          <h2>
            Invoices
          </h2>

          <p>
            Manage, track and organize your customer invoices.
          </p>
        </div>

        <div className="invoice-heading-actions">

          <button
            className="invoice-refresh"
            onClick={loadInvoices}
            disabled={loading}
            aria-label="Refresh invoices"
          >
            <RefreshCw size={17} />
          </button>

          <button
            className="invoice-add"
            onClick={openCreateForm}
          >
            <Plus size={18} />
            Create Invoice
          </button>

        </div>

      </div>

      <div className="invoice-stats">

        <div className="invoice-stat">
          <span>
            Total Invoiced
          </span>

          <h3>
            {money(totalAmount)}
          </h3>

          <small>
            {invoices.length} invoices
          </small>
        </div>

        <div className="invoice-stat">
          <span>
            Paid Amount
          </span>

          <h3>
            {money(paidAmount)}
          </h3>

          <small className="invoice-green">
            Successfully paid
          </small>
        </div>

        <div className="invoice-stat">
          <span>
            Pending Amount
          </span>

          <h3>
            {money(pendingAmount)}
          </h3>

          <small>
            Awaiting payment
          </small>
        </div>

        <div className="invoice-stat">
          <span>
            Overdue Amount
          </span>

          <h3>
            {money(overdueAmount)}
          </h3>

          <small className="invoice-red">
            Requires attention
          </small>
        </div>

      </div>

      <section className="panel invoice-table-panel">

        <div className="invoice-toolbar">

          <div>
            <h3>
              All Invoices
            </h3>

            <p>
              Your complete invoice history
            </p>
          </div>

          <div className="invoice-search">

            <Search size={17} />

            <input
              placeholder="Search invoices..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />

          </div>

        </div>

        <div className="invoice-filters">

          {[
            "All",
            "Pending",
            "Paid",
            "Overdue"
          ].map((status) => (

            <button
              key={status}
              className={
                filter === status
                  ? "selected"
                  : ""
              }
              onClick={() =>
                setFilter(status)
              }
            >
              {status}
            </button>

          ))}

        </div>

        {error && (
          <div className="invoice-error">
            {error}
          </div>
        )}

        {loading ? (

          <div className="invoice-empty">
            Loading invoices...
          </div>

        ) : filteredInvoices.length === 0 ? (

          <div className="invoice-empty">

            <FileText size={38} />

            <h3>
              No invoices found
            </h3>

            <p>
              Create an invoice or change your search filters.
            </p>

          </div>

        ) : (

          <div className="table-scroll">

            <table>

              <thead>

                <tr>
                  <th>INVOICE</th>
                  <th>CUSTOMER</th>
                  <th>AMOUNT</th>
                  <th>DUE DATE</th>
                  <th>STATUS</th>
                  <th>ACTIONS</th>
                </tr>

              </thead>

              <tbody>

                {filteredInvoices.map((invoice) => {

                  const status =
                    getStatus(invoice);

                  return (

                    <tr key={invoice._id}>

                      <td>

                        <strong className="invoice-number">
                          {invoice.invoiceNumber}
                        </strong>

                        <small className="invoice-description">
                          {invoice.description}
                        </small>

                      </td>

                      <td>

                        <strong>
                          {invoice.customerName}
                        </strong>

                        <small className="invoice-description">
                          {invoice.customerEmail}
                        </small>

                      </td>

                      <td className="amount">
                        {money(invoice.amount)}
                      </td>

                      <td>

                        <span className="invoice-date">

                          <CalendarDays size={14} />

                          {new Date(
                            invoice.dueDate
                          ).toLocaleDateString(
                            "en-US",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric"
                            }
                          )}

                        </span>

                      </td>

                      <td>

                        <span
                          className={`status ${status.toLowerCase()}`}
                        >
                          {status}
                        </span>

                      </td>

                      <td>

                        <div className="invoice-actions">

                          {/* EDIT ONLY UNPAID INVOICES */}
                          {status !== "Paid" && (
                            <button
                              onClick={() =>
                                openEditForm(invoice)
                              }
                              title="Edit invoice"
                              aria-label="Edit invoice"
                            >
                              <Pencil size={16} />
                            </button>
                          )}

                          <button
                            onClick={() =>
                              handleDelete(
                                invoice._id
                              )
                            }
                            title="Delete invoice"
                            aria-label="Delete invoice"
                            className="delete-action"
                          >
                            <Trash2 size={16} />
                          </button>

                          {invoice.status !== "Paid" && (

                            <PayPalButtons
                              style={{
                                layout: "horizontal",
                                color: "blue",
                                label: "pay",
                                height: 35
                              }}

                              createOrder={async () => {

                                const order =
                                  await createPayPalOrder(
                                    invoice._id
                                  );

                                return order.orderID;

                              }}

                              onApprove={async (data) => {

                                try {

                                  setError("");

                                  const result =
                                    await capturePayPalOrder(
                                      data.orderID
                                    );

                                  if (
                                    result.success
                                  ) {
                                    await loadInvoices();
                                  }

                                } catch (err) {

                                  setError(
                                    err.response?.data?.message ||
                                    "Unable to complete PayPal payment."
                                  );

                                }

                              }}

                              onError={(err) => {

                                console.error(
                                  "PayPal Error:",
                                  err
                                );

                                setError(
                                  "PayPal payment failed. Please try again."
                                );

                              }}

                            />

                          )}

                        </div>

                      </td>

                    </tr>

                  );

                })}

              </tbody>

            </table>

          </div>

        )}

        <div className="invoice-footer">

          Showing{" "}
          {filteredInvoices.length}{" "}
          of{" "}
          {invoices.length}{" "}
          invoices

        </div>

      </section>

      {showForm && (

        <div
          className="invoice-modal-overlay"
          onClick={() =>
            !saving &&
            setShowForm(false)
          }
        >

          <div
            className="invoice-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="invoice-modal-header">

              <div>

                <h2>
                  {editingId
                    ? "Edit Invoice"
                    : "Create Invoice"}
                </h2>

                <p>
                  Enter your customer and payment details.
                </p>

              </div>

              <button
                onClick={() =>
                  setShowForm(false)
                }
                disabled={saving}
                aria-label="Close form"
              >
                <X size={20} />
              </button>

            </div>

            <form onSubmit={handleSubmit}>

              <label>
                Customer Name
              </label>

              <input
                name="customerName"
                value={form.customerName}
                onChange={handleChange}
                placeholder="Enter customer name"
                required
              />

              <label>
                Customer Email
              </label>

              <input
                type="email"
                name="customerEmail"
                value={form.customerEmail}
                onChange={handleChange}
                placeholder="customer@example.com"
                required
              />

              <label>
                Invoice Description
              </label>

              <input
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Enter service or product"
                required
              />

              <div className="invoice-form-grid">

                <div>

                  <label>
                    Amount (USD)
                  </label>

                  <input
                    type="number"
                    name="amount"
                    value={form.amount}
                    onChange={handleChange}
                    min="0.01"
                    step="0.01"
                    placeholder="1500"
                    required
                  />

                </div>

                <div>

                  <label>
                    Due Date
                  </label>

                  <input
                    type="date"
                    name="dueDate"
                    value={form.dueDate}
                    onChange={handleChange}
                    required
                  />

                </div>

              </div>

              {error && (
                <div className="invoice-error">
                  {error}
                </div>
              )}

              <div className="invoice-modal-actions">

                <button
                  type="button"
                  className="invoice-cancel"
                  onClick={() =>
                    setShowForm(false)
                  }
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="invoice-submit"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingId
                      ? "Save Changes"
                      : "Create Invoice"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}

export default InvoicePage;