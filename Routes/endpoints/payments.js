const express = require('express');
const router = express.Router();
const con = require('../../dbconnect');
const {
  getPayments,
  getPaymentById,
  createPayment ,
  updatePayment ,
  deletePayment ,
} = require('../../Controllers/PaymentController');



router.use(express.urlencoded({ extended: true }));

// Routes
router.get('/', getPayments);
router.get('/:id', getPaymentById);
router.post('/', createPayment);
router.put('/:id', updatePayment);
router.delete('/:id', deletePayment);



module.exports = router;