const {
  sequelize,
  SplitBill,
  SplitBillParticipant,
} = require("../Models/index");
const User = require("../Models/user");
const Op = require("sequelize");

class SplitBillService {
  static async validateParticipants(participants) {
    const guestParticipants = [];
    const userParticipants = [];
    const userIdsToCheck = new Set();

    const phoneRegex = /^\+?[0-9]{10,15}$/;

    if (!participants || participants.length === 0) {
      throw new Error("You must add at least one participant");
    }

    for (const p of participants) {
      if (p.type === "GUEST") {
        if (!p.name || p.name.trim().length < 2) {
          throw new Error(`Invalid guest name: ${p.name}`);
        }
        const isPhoneValid = p.phone && phoneRegex.test(p.phone);
        if (!isPhoneValid) {
          throw new Error(`Guest '${p.name}' requires a valid phone number.`);
        }
        guestParticipants.push({
          name: p.name.trim(),
          phone: p.phone,
          percent: p.percent ?? null,
          amount: p.amount ?? null,
          originalIndex: guestParticipants.length + userParticipants.length,
          type: "GUEST",
        });
      } else if (p.type === "USER") {
        if (!p.userId)
          throw new Error("Participant of type USER missing userId");
        if (userIdsToCheck.has(p.userId)) {
          throw new Error(`Duplicate user detected in payload: ${p.userId}`);
        }
        userIdsToCheck.add(p.userId);
        userParticipants.push({
          userId: p.userId,
          percent: p.percent ?? null,
          amount: p.amount ?? null,
          type: "USER",
        });
      } else {
        throw new Error("Invalid participant type. Must be USER or GUEST");
      }
    }

    if (userIdsToCheck.size > 0) {
      const foundUsers = await User.findAll({
        where: {
          id: {
            [Op.in]: Array.from(userIdsToCheck),
          },
        },
        attributes: ["id"],
        raw: true,
      });

      if (foundUsers.length !== userIdsToCheck.size) {
        const foundIds = new Set(foundUsers.map((u) => u.id));
        const invalidIds = Array.from(userIdsToCheck).filter(
          (id) => !foundIds.has(id)
        );
        throw new Error(`Invalid User IDs provided: ${invalidIds.join(", ")}`);
      }
    }

    return { guestParticipants, userParticipants };
  }

  static async createBill({
    creatorId,
    title,
    amount,
    currency = "NGN",
    participants = [],
    splitMethod = "EVEN",
    dueDate = null,
    description = null,
    imageUrl = null,
  }) {
    if (!title || !amount || !participants || participants.length === 0) {
      throw new Error("Missing required fields: title, amount, participants");
    }

    await this.validateParticipants(participants);
    const totalParticipantsCount = participants.length;

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
          image_url: imageUrl,
          total_participants: totalParticipantsCount,
        },
        { transaction: t }
      );

      const dbRows = participants.map((p) => {
        if (p.type === "USER") {
          return {
            split_bill_id: bill.id,
            user_id: p.userId,
            guest_name: null,
            guest_phone: null,
            amount_owed: 0.0,
            percentage: p.percent ?? null,
            created_at: new Date(),
          };
        } else {
          return {
            split_bill_id: bill.id,
            user_id: null,
            guest_name: p.name,
            guest_phone: p.phone,
            amount_owed: 0.0,
            percentage: p.percent ?? null,
            created_at: new Date(),
          };
        }
      });

      console.log("ADDING PARTICIPANT TO BILL:", bill.id);

      const exists = await SplitBill.findByPk(bill.id);
      console.log("Bill Exists:", !!exists);

      console.log("db rows", dbRows);

      await SplitBillParticipant.bulkCreate(dbRows, { transaction: t });

      await this.computeAndSaveShares(bill, participants, splitMethod, t);

      return bill;
    });
  }

  static async computeAndSaveShares(
    bill,
    participants,
    splitMethod,
    transaction
  ) {
    const billRecord =
      typeof bill === "object" && bill.id
        ? bill
        : await SplitBill.findByPk(bill.id, { transaction });

    const totalAmount = parseFloat(billRecord.amount);
    const numParticipants = participants.length;

    const dbParticipants = await SplitBillParticipant.findAll({
      where: { split_bill_id: billRecord.id },
      order: [
        ["created_at", "ASC"],
        ["id", "ASC"],
      ],
      transaction,
    });

    if (dbParticipants.length !== numParticipants) {
      throw new Error("Mismatch between input participants and DB rows");
    }

    const round2 = (v) => Math.round(v * 100) / 100;

    const owedAmounts = new Array(numParticipants).fill(0.0);

    if (splitMethod === "EVEN") {
      const base = Math.floor((totalAmount / numParticipants) * 100) / 100;
      let sumBase = base * numParticipants;
      let remainder = Math.round((totalAmount - sumBase) * 100);

      for (let i = 0; i < numParticipants; i++) {
        let centAdd = 0;
        if (remainder > 0) {
          centAdd = 1;
          remainder--;
        }
        owedAmounts[i] = round2(base + centAdd / 100);
      }

      const totalComputed = owedAmounts.reduce((a, b) => a + b, 0);
      const diff = round2(totalAmount - totalComputed);
      if (Math.abs(diff) >= 0.01) {
        owedAmounts[0] = round2(owedAmounts[0] + diff);
      }
    } else if (splitMethod === "MANUAL") {
      let sum = 0;
      for (let i = 0; i < participants.length; i++) {
        const p = participants[i];
        if (typeof p.amount !== "number") {
          throw new Error(
            "Manual split expects each participant to specify an amount"
          );
        }
        owedAmounts[i] = round2(p.amount);
        sum += owedAmounts[i];
      }
      const diff = Math.abs(round2(sum) - round2(totalAmount));
      if (diff > 0.1) {
        throw new Error(
          `Manual amounts sum to ${sum} but bill amount is ${totalAmount}`
        );
      }
      const totalComputed = owedAmounts.reduce((a, b) => a + b, 0);
      const adjust = round2(totalAmount - totalComputed);
      if (Math.abs(adjust) >= 0.01) {
        owedAmounts[0] = round2(owedAmounts[0] + adjust);
      }
    } else if (splitMethod === "RANDOM_PICK") {
      const payerIndex = Math.floor(Math.random() * numParticipants);
      for (let i = 0; i < numParticipants; i++) {
        owedAmounts[i] = i === payerIndex ? round2(totalAmount) : 0.0;
      }
    } else {
      throw new Error("Unsupported split method: " + splitMethod);
    }

    let totalPaidSum = 0.0;
    for (let i = 0; i < dbParticipants.length; i++) {
      const row = dbParticipants[i];
      const owed = owedAmounts[i];

      await SplitBillParticipant.update(
        {
          amount_owed: owed,
        },
        {
          where: { id: row.id },
          transaction,
        }
      );

      totalPaidSum += parseFloat(row.amount_paid || 0.0);
    }

    await SplitBill.update(
      { total_participants: numParticipants, total_paid: round2(totalPaidSum) },
      { where: { id: billRecord.id }, transaction }
    );

    return true;
  }

  static async addParticipant(
    billId,
    { userId = null, guestName = null, guestPhone = null }
  ) {
    return await sequelize.transaction(async (t) => {
      const bill = await SplitBill.findByPk(billId, {
        include: [{ model: SplitBillParticipant, as: "participants" }],
        transaction: t,
      });

      if (!bill) throw new Error("Bill not found");
      if (bill.is_finalized)
        throw new Error("Cannot add participant to a finalized bill.");

      if (!userId && !guestPhone)
        throw new Error("Must provide either userId or guestPhone for guest");

      if (userId) {
        const user = await User.findByPk(userId, { transaction: t });
        if (!user) throw new Error("User does not exist");

        const exists = bill.participants.some((p) => p.user_id === userId);
        if (exists) throw new Error("User already a participant");

        if (bill.user_id === userId)
          throw new Error("Bill owner is already a participant");
      }

      if (!userId && guestPhone) {
        if (!guestName)
          throw new Error("Guest name is required when adding a guest");

        const exists = bill.participants.some(
          (p) => p.user_id === null && p.guest_phone === guestPhone
        );
        if (exists) throw new Error("Guest already added");
      }

      await SplitBillParticipant.create(
        {
          split_bill_id: billId,
          user_id: userId,
          guest_name: guestName || null,
          guest_phone: guestPhone || null,
          percentage: null,
          amount_owed: 0,
        },
        { transaction: t }
      );

      await this.computeAndSaveShares(billId, bill.split_method, t);
    });
  }

  static async removeParticipant(billId, { userId = null, guestPhone = null }) {
    return await sequelize.transaction(async (t) => {
      const bill = await SplitBill.findByPk(billId, {
        include: [{ model: SplitBillParticipant, as: "participants" }],
        transaction: t,
      });

      if (!bill) throw new Error("Bill not found");
      if (bill.is_finalized)
        throw new Error("Cannot remove participant from a finalized bill.");

      if (!userId && !guestPhone)
        throw new Error("Must provide userId OR guestPhone");

      const participant = bill.participants.find((p) => {
        if (userId) return p.user_id === userId;
        if (guestPhone)
          return p.user_id === null && p.guest_phone === guestPhone;
        return false;
      });

      if (!participant) throw new Error("Participant not found");

      if (bill.participants.length <= 1)
        throw new Error("Cannot remove the last remaining participant");

      await SplitBillParticipant.destroy({
        where: {
          split_bill_id: billId,
          ...(userId ? { user_id: userId } : { guest_phone: guestPhone }),
        },
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
      include: [{ model: SplitBillParticipant, as: "participants" }],
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
