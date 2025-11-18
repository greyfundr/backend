const {Sequelize, DataTypes} = require("sequelize");

const sequelize = require('../Config/sequalize_db');

const SplitBill = sequelize.define("splitbill", {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        bill_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: true,
        },

        amount_to_pay: {
            type: DataTypes.DOUBLE,
            allowNull: false,
        },
        paid: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            unique: true,
        },
});
