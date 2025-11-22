const sequelize = require("../Config/sequalize_db");
const Payment = require("./payment");
const SplitBill = require("./splitbill");
const SplitBillParticipant = require("./splitBillParticipant");

SplitBill.hasMany(SplitBillParticipant, {
  foreignKey: "split_bill_id",
  as: "participants",
  onDelete: "CASCADE",
});

SplitBill.hasMany(Payment, {
  foreignKey: "participant_id",
  through: SplitBillParticipant,
  as: "payments",
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

// User.hasMany(SplitBill, { foreignKey: "creator_id", as: "createdBills" });
// SplitBill.belongsTo(User, { foreignKey: "creator_id", as: "creator" });

// User.hasMany(SplitBillParticipant, {
//   foreignKey: "user_id",
//   as: "billParticipation",
// });
// SplitBillParticipant.belongsTo(User, { foreignKey: "user_id", as: "user" });

module.exports = { sequelize, SplitBill, SplitBillParticipant, Payment };
