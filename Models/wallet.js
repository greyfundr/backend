const pool = require('../dbconnect');
const bcrypt = require('bcryptjs');

class User {
    static async create(email, password, phone) {
        const hashedPassword = await bcrypt.hash(password, 10);

        const [result] = await pool.execute(
            'INSERT INTO users (email, password_hash, phone) VALUES (?, ?,?)',
            [email, hashedPassword, phone]
        );


        return result.insertId;
    }

    static async getWalletBallance(id) {
        const [rows] = await pool.execute(
            'SELECT balance FROM wallet WHERE id = ?',
            [email]
        );
        return rows[0];
    }

    static async getWallet(id) {
        const [rows] = await pool.execute(
            'SELECT * FROM wallet WHERE id = ?',
            [id]
        );
        return rows[0];
    }

    static async updateWalletBalance(id, amount) {
        await pool.execute(
            'UPDATE users SET wallet_balance = wallet_balance + ? WHERE id = ?',
            [amount, id]
        );
    }
}

module.exports = User;