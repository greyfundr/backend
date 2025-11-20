module.exports = {
  async notifyParticipantsCreated(bill) {
    const participants = bill.participants || [];

    for (const p of participants) {
      console.log(
        `📩 Notification → User ${p.user_id}: You were added to bill "${bill.title}"`
      );
      // pushService.send()
      // emailService.send()
    }
  },

  async notifyBillFinalized(bill) {
    const participants = bill.participants || [];

    for (const p of participants) {
      console.log(
        `📩 Bill Finalized → User ${p.user_id}: "${bill.title}" has been finalized.`
      );
    }
  },

  async notifyPaymentReceived(participant) {
    console.log(
      `💰 Payment → User ${participant.user_id} has paid for bill ${participant.bill_id}`
    );
  },
};
