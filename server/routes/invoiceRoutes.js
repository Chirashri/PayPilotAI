
const express = require("express");

const router = express.Router();

const {
    createInvoice,
    getInvoices,
    getInvoiceById,
    updateInvoice,
    deleteInvoice
} = require("../controllers/invoiceController");

router.post("/", createInvoice);
router.get("/", getInvoices);
router.get("/:id", getInvoiceById);
router.put("/:id", updateInvoice);
router.delete("/:id", deleteInvoice);

module.exports = router;
