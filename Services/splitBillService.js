const { sequelize, SplitBill, SplitBillParticipant } = require("../Models/index");

function calculateEvenSplit(total, count) {
  const per = parseFloat((total / count).toFixed(2));
  const sum = per * count;
  const remainder = parseFloat((total - sum).toFixed(2));
  return { per, remainder };
}

class SplitBillService {
  static async createBill({
    creatorId,
    title,
    amount,
    currency = "NGN",
    participants = [],
    splitMethod = "EVEN",
    dueDate = null,
    description = null,
  }) {
    if (!title || !amount || !participants || participants.length === 0) {
      throw new Error("Missing required fields: title, amount, participants");
    }

    return await sequelize.transaction(async (t) => {
      const bill = await SplitBill.create(
        {
          title,
          description,
          amount,
          currency,
          creator_id: creatorId,
          split_method: splitMethod,
          due_date: dueDate,
        },
        { transaction: t }
      );

      const participantRows = participants.map((p) => ({
        split_bill_id: bill.id,
        user_id: p.userId,
        amount_to_pay: 0,
        percent_of_total: p.percent ?? null,
      }));

      await SplitBillParticipant.bulkCreate(participantRows, { transaction: t });

      await this.computeAndSaveShares(bill.id, splitMethod, t, participants);

      return bill;
    });
  }

  static async computeAndSaveShares(
    billId,
    splitMethod,
    transaction,
    participantsPayload = null
  ) {
    const bill = await SplitBill.findByPk(billId, {
      include: [{ model: SplitBillParticipant, as: "participants" }],
      transaction,
    });

    if (!bill) throw new Error("Bill not found");

    const participants = bill.participants;
    const total = parseFloat(bill.amount);

    if (splitMethod === "EVEN") {
      const count = participants.length;
      const { per, remainder } = calculateEvenSplit(total, count);

      for (let i = 0; i < participants.length; i++) {
        const amount = per + (i === 0 ? remainder : 0);
        participants[i].amount_to_pay = amount;
        participants[i].percent_of_total = Number(
          ((amount / total) * 100).toFixed(2)
        );
        await participants[i].save({ transaction });
      }
    } else if (splitMethod === "MANUAL") {
      if (!participantsPayload) {
        throw new Error("Manual split requires participant amounts payload.");
      }

      const map = new Map();
      participantsPayload.forEach((p) => map.set(p.userId, p));

      for (const pRow of participants) {
        const input = map.get(pRow.user_id);
        if (!input)
          throw new Error(`Missing manual split for user ${pRow.user_id}`);
        let amt;
        if (typeof input.amount === "number") {
          amt = parseFloat(input.amount.toFixed(2));
        } else if (typeof input.percent === "number") {
          amt = parseFloat(((input.percent / 100) * total).toFixed(2));
        } else {
          throw new Error(`Invalid manual input for user ${pRow.user_id}`);
        }
        pRow.amount_to_pay = amt;
        pRow.percent_of_total = Number(((amt / total) * 100).toFixed(2));
        await pRow.save({ transaction });
      }
    } else if (splitMethod === "RANDOM_PICK") {
      const randomIndex = Math.floor(Math.random() * participants.length);
      for (let i = 0; i < participants.length; i++) {
        const p = participants[i];
        if (i === randomIndex) {
          p.amount_to_pay = 0;
          p.percent_of_total = 0;
        } else {
          const per = parseFloat(
            (total / (participants.length - 1)).toFixed(2)
          );
          p.amount_to_pay = per;
          p.percent_of_total = Number(((per / total) * 100).toFixed(2));
        }
        await p.save({ transaction });
      }
    } else {
      throw new Error("Unknown split method");
    }
  }

  static async addParticipant(billId, userId) {
    return await sequelize.transaction(async (t) => {
      const bill = await SplitBill.findByPk(billId, {
        include: [{ model: SplitBillParticipant, as: "participants" }],
        transaction: t,
      });
      if (!bill) throw new Error("Bill not found");
      if (bill.is_finalized)
        throw new Error("Cannot add participant to a finalized bill.");

      const exists = bill.participants.find((p) => p.user_id === userId);
      if (exists) throw new Error("User already a participant");

      await SplitBillParticipant.create(
        { split_bill_id: billId, user_id: userId },
        { transaction: t }
      );

      await this.computeAndSaveShares(billId, bill.split_method, t);
    });
  }

  static async removeParticipant(billId, userId) {
    return await sequelize.transaction(async (t) => {
      const bill = await SplitBill.findByPk(billId, {
        include: [{ model: SplitBillParticipant, as: "participants" }],
        transaction: t,
      });
      if (!bill) throw new Error("Bill not found");
      if (bill.is_finalized)
        throw new Error("Cannot remove participant from a finalized bill.");

      await SplitBillParticipant.destroy({
        where: { split_bill_id: billId, user_id: userId },
        transaction: t,
      });

      await this.computeAndSaveShares(billId, bill.split_method, t);
    });
  }

  static async finalizeBill(billId) {
    return await sequelize.transaction(async (t) => {
      const bill = await SplitBill.findByPk(billId, {
        include: [{ model: SplitBillParticipant, as: "participants" }],
        transaction: t,
      });
      if (!bill) throw new Error("Bill not found");
      bill.is_finalized = true;
      await bill.save({ transaction: t });
      // optionally send notifications here
      return bill;
    });
  }

  static async markParticipantPaid(billId, userId, paidAt = new Date()) {
    const participant = await SplitBillParticipant.findOne({
      where: { split_bill_id: billId, user_id: userId },
    });
    if (!participant) throw new Error("Participant not found");
    participant.paid = true;
    participant.paid_at = paidAt;
    await participant.save();
    return participant;
  }

  static async getBillDetails(billId) {
    const bill = await SplitBill.findByPk(billId, {
      include: [
        { model: SplitBillParticipant, as: "participants" },
      ],
    });
    if (!bill) throw new Error("Bill not found");
    return bill;
  }

  static async listUserSplits(userId) {
    return SplitBillParticipant.findAll({
      where: { user_id: userId },
      include: [{ model: SplitBill, as: "Bill" }],
    });
  }
}

module.exports = SplitBillService;
