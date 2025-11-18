const { DataTypes } = require("sequelize");
const sequelize = require("../Config/sequalize_db");

const SplitBillParticipant = sequelize.define(
  "SplitBillParticipant",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    split_bill_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "SplitBill", key: "id" },
    },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    amount_owed: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
    },
    amount_paid: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0.00,
    },
    percentage: {
        type: DataTypes.FLOAT,
        allowNull: true,
    },
    status: {
        type: DataTypes.ENUM('UNPAID', 'PAID'),
        defaultValue: 'UNPAID'
    },
    paid: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    paid_at: { type: DataTypes.DATE, allowNull: true },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "split_bill_participants",
    timestamps: false,
    indexes: [{ unique: true, fields: ["split_bill_id", "user_id"] }],
  }
);

module.exports = SplitBillParticipant;
