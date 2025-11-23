const sequelize = require("../Config/sequalize_db");
const Payment = require("./payment");
const SplitBill = require("./splitbill");
const SplitBillParticipant = require("./splitBillParticipant");

SplitBill.hasMany(SplitBillParticipant, {
  foreignKey: "split_bill_id",
  as: "participants",
  onDelete: "CASCADE",
});

SplitBillParticipant.belongsTo(SplitBill, {
  foreignKey: "split_bill_id",
  as: "bill",
});

SplitBillParticipant.hasMany(Payment, {
  foreignKey: "participant_id",
  as: "payments",
  onDelete: "CASCADE",
});

Payment.belongsTo(SplitBillParticipant, {
  foreignKey: "participant_id",
  as: "participant",
});

module.exports = { sequelize, SplitBill, SplitBillParticipant, Payment };
