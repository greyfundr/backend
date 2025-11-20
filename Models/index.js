const sequelize = require("../Config/sequalize_db");
const SplitBill = require("./splitbill");
const SplitBillParticipant = require("./splitBillParticipant");
// const User = require("./user");

SplitBill.hasMany(SplitBillParticipant, {
  foreignKey: "split_bill_id",
  as: "participants",
});

SplitBillParticipant.belongsTo(SplitBill, {
  foreignKey: "split_bill_id",
  as: "bill",
});


// User.hasMany(SplitBill, { foreignKey: "creator_id", as: "createdBills" });
// SplitBill.belongsTo(User, { foreignKey: "creator_id", as: "creator" });

// User.hasMany(SplitBillParticipant, {
//   foreignKey: "user_id",
//   as: "billParticipation",
// });
// SplitBillParticipant.belongsTo(User, { foreignKey: "user_id", as: "user" });

module.exports = { sequelize, SplitBill, SplitBillParticipant };
