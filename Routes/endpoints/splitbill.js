const express = require("express");
const {
  getSplitBill,
  createSplitBill,
  getUserSplitBills,
  finalizeBill,
  addParticipant,
  removeParticipant,
  applyPayment,
  // markPaid,
} = require("../../Controllers/SplitBill/SplitBillController");
const { verifyToken, validateRequest } = require("../../middleware");
const {
  createBillSchema,
  applyPaymentSchema,
  participantSchema,
} = require("../../Validators/billValidator");

const router = express.Router();

router.use(express.urlencoded({ extended: true }));

router.get("/:id", verifyToken, getSplitBill);
router.post(
  "/create",
  verifyToken,
  validateRequest(createBillSchema),
  createSplitBill
);
router.get("/", verifyToken, getUserSplitBills);
router.post(
  "/:id/participants",
  verifyToken,
  validateRequest(participantSchema),
  addParticipant
);
router.delete(
  "/:id/participants",
  verifyToken,
  validateRequest(participantSchema),
  removeParticipant
);
router.post(
  "/participants/:id/payments",
  verifyToken,
  validateRequest(applyPaymentSchema),
  applyPayment
);
router.post("/:id/finalize", verifyToken, finalizeBill);
// router.post("/:id/participants/:userId/paid", markPaid);

module.exports = router;
