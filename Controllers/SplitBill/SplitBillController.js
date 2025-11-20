const SplitBillService = require("../../Services/splitBillService");
const NotificationService = require("../../Services/notificationService");

const getSplitBill = async (req, res, next) => {
  try {
    const billId = req.params.id;
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
    next(error);
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
