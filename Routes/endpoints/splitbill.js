const express = require("express");
const {
  getSplitBill,
  createSplitBill,
  finalizeBill,
  // markPaid,
} = require("../../Controllers/SplitBill/SplitBillController");
const { verifyToken } = require("../../middleware/auth");

const router = express.Router();

router.use(express.urlencoded({ extended: true }));

router.get("/:id", verifyToken, getSplitBill);
router.post("/create", verifyToken, createSplitBill);
router.post("/:id/finalize", verifyToken, finalizeBill);
// router.post("/:id/participants/:userId/paid", markPaid);

module.exports = router;
