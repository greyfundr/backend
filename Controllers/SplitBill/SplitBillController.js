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

const getUserSplitBills = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const result = await SplitBillService.getUserBills(userId);

    return res.status(200).json({
      msg: "User split bills retrieved successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error fetching bill:", error);
    next(error);
  }
};

const addParticipant = async (req, res, next) => {
  try {
    const billId = req.params.id;
    const { userId, guestName, guestPhone } = req.body;

    await SplitBillService.addParticipant(billId, {
      userId,
      guestName,
      guestPhone,
    });

    return res.status(200).json({
      status: "success",
      message: "Participant added successfully",
    });
  } catch (error) {
    next(error);
  }
};

const removeParticipant = async (req, res, next) => {
  try {
    const billId = req.params.id;
    const { userId, guestPhone } = req.body;

    await SplitBillService.removeParticipant(billId, {
      userId,
      guestPhone,
    });

    return res.status(200).json({
      status: "success",
      message: "Participant removed successfully",
    });
  } catch (error) {
    next(error);
  }
};

const applyPayment = async (req, res, next) => {
  try {
    const participantId = req.params.id;
    const { amount } = req.body;

    const result = await SplitBillService.applyPayment(participantId, amount);

    res.status(200).json({
      status: "success",
      message: "Payment applied successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const finalizeBill = async (req, res, next) => {
  try {
    const billId = Number(req.params.id);
    const bill = await SplitBillService.finalizeBill(billId);

    await NotificationService.notifyBillFinalized(bill);

    return res.status(200).json({ msg: "Bill finalized", data: bill });
  } catch (error) {
    next(error);
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
  getUserSplitBills,
  addParticipant,
  removeParticipant,
  applyPayment,
  finalizeBill,
  // markPaid,
};
