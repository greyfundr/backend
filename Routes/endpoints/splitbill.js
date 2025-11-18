const express = require("express");
const router = express.Router();

const {
  getSplitBill,
  createSplitBill,
  finalizeBill,
  // markPaid,
} = require("../../Controllers/SplitBill/SplitBillController");

router.use(express.urlencoded({ extended: true }));

router.get("/getSplitBill/:id", getSplitBill);
router.post("/create", createSplitBill);
router.post("/:id/finalize", finalizeBill);
// router.post("/:id/participants/:userId/paid", markPaid);

module.exports = router;
