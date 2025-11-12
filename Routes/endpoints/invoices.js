const express = require('express');
const router = express.Router();
const con = require('../../dbconnect');
const {
  getInvoices,
  getInvoiceById,
  createInvoice ,
  updateInvoice ,
  deleteInvoice ,
} = require('../../Controllers/InvoiceController');



router.use(express.urlencoded({ extended: true }));

// Routes
router.get('/', getInvoices);
router.get('/:id', getInvoiceById);
router.post('/', createInvoice);
router.put('/:id', updateInvoice);
router.delete('/:id', deleteInvoice);



module.exports = router;