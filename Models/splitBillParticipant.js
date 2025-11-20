const { DataTypes } = require("sequelize");
const sequelize = require("../Config/sequalize_db");

const SplitBillParticipant = sequelize.define(
  "SplitBillParticipant",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    split_bill_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: "split_bills", key: "id" },
    },
    user_id: { type: DataTypes.UUID, allowNull: true },
    guest_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    guest_phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    amount_owed: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },
    amount_paid: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0.0,
    },
    percentage: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("UNPAID", "PAID"),
      defaultValue: "UNPAID",
    },
    paid: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    paid_at: { type: DataTypes.DATE, allowNull: true },
    invite_code: {
      type: DataTypes.STRING(12),
      allowNull: true,
      unique: true,
    },
    invite_expires_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "split_bill_participants",
    timestamps: false,
    indexes: [{ fields: ["split_bill_id"] }],
    // validate: {
    //   eitherUserOrGuest() {
    //     const isUser = !!this.user_id;
    //     const isGuest = !!this.guest_name && !!this.guest_phone;

    //     if (!isUser && !isGuest) {
    //       throw new Error(
    //         "Participant must have either a user_id or a guest (name + phone)"
    //       );
    //     }
    //   },
    // },
  }
);

module.exports = SplitBillParticipant;
