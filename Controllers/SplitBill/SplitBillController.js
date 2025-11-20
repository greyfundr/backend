// userController.js
// This file contains all the basic CRUD controllers for user management in a Node.js application using Express.js and MySQL (via mysql2 package).
// Assumptions:
// - You have a MySQL database with a 'users' table: id (INT, AUTO_INCREMENT, PRIMARY KEY), name (VARCHAR), email (VARCHAR, UNIQUE), password (VARCHAR).
// - Database connection is handled in '../config/database.js' exporting a mysql2 pool (e.g., const pool = mysql.createPool({...}); module.exports = pool;).
// - Install dependencies: npm install express mysql2 (and bcrypt for production password hashing).
// - In production, always hash passwords (e.g., using bcrypt) and add input validation (e.g., using Joi or express-validator).
// - These controllers handle basic operations: GET all users, GET by ID, POST create, PUT update, DELETE by ID.

const SplitBillService = require("../../Services/splitBillService");
const NotificationService = require("../../Services/notificationService");
// const PaymentService = require("../../Services/paymentService");

const getSplitBill = async (req, res) => {
  try {
    const billId = Number(req.params.id);
    const result = await SplitBillService.getBillDetails(billId);

    if (!result) {
      return res.status(400).json({ msg: "Bill not found" });
    }

    return res.status(200).json({
      msg: "Bill loaded successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error fetching bill:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const createSplitBill = async (req, res) => {
  try {
    const creatorId = req.user.id;
    const bill = await SplitBillService.createBill({
      creatorId,
      ...req.body,
    });

    await NotificationService.notifyParticipantsCreated(bill);

    return res.status(201).json({
      msg: "Bill created successfully",
      data: bill,
    });
  } catch (error) {
    console.error("Error creating bill:", error);
    return res.status(500).json({ error: error.message });
  }
};

const finalizeBill = async (req, res) => {
  try {
    const billId = Number(req.params.id);
    const bill = await SplitBillService.finalizeBill(billId);

    await NotificationService.notifyBillFinalized(bill);

    return res.status(200).json({ msg: "Bill finalized", data: bill });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

// const markPaid = async (req, res) => {
//   try {
//     const billId = Number(req.params.id);
//     const userId = Number(req.params.userId);
//     const { payment_reference, proof_url } = req.body;

//     const participant = await PaymentService.applyPayment({
//       billId,
//       userId,
//       payment_reference,
//       proof_url,
//     });

//     await NotificationService.notifyPaymentReceived(participant);

//     return res.status(200).json({
//       msg: "Payment recorded",
//       data: participant,
//     });
//   } catch (error) {
//     return res.status(400).json({ error: error.message });
//   }
// };

module.exports = {
  getSplitBill,
  createSplitBill,
  finalizeBill,
  // markPaid,
};