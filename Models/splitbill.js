const { DataTypes } = require("sequelize");
const sequelize = require("../Config/sequalize_db");

const SplitBill = sequelize.define(
  "SplitBill",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    title: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    currency: {
      type: DataTypes.STRING(3),
      allowNull: false,
      defaultValue: "NGN",
    },
    amount: { type: DataTypes.DECIMAL(18, 2), allowNull: false },
    creator_id: { type: DataTypes.INTEGER, allowNull: false },
    split_method: {
      type: DataTypes.ENUM("EVEN", "MANUAL", "RANDOM_PICK"),
      allowNull: false,
      defaultValue: "EVEN",
    },
    due_date: { type: DataTypes.DATE, allowNull: true },
    is_finalized: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    status: {
      type: DataTypes.ENUM("active", "completed", "cancelled"),
      allowNull: false,
      defaultValue: "active",
    },
    image_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    total_participants: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    total_paid: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "split_bills",
    timestamps: false,
  }
);

module.exports = SplitBill;
