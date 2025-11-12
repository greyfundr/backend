const pool = require('../dbconnect');
const bcrypt = require('bcryptjs');

class User {
    static async create(email, password, phone) {
        const hashedPassword = await bcrypt.hash(password, 10);

        //const sql = 'INSERT INTO `users`(`email`,`phone`, `password_hash`) VALUES (?,?,?,?,?)'
        const [result] = await pool.execute(
            'INSERT INTO users (email, password_hash, phone) VALUES (?, ?,?)',
            [email, hashedPassword, phone]
        );


        return result.insertId;
    }

    static async updateUserProfile(email) {
        const [rows] = await pool.execute(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );
        return rows[0];
    }

    static async getUserProfile(id) {
        const [rows] = await pool.execute(
            'SELECT * FROM users WHERE id = ?',
            [id]
        );
        return rows[0];
    }

    static async deleteUserProfile(id, amount) {
        await pool.execute(
            'UPDATE users SET wallet_balance = wallet_balance + ? WHERE id = ?',
            [amount, id]
        );
    }
}

module.exports = User;