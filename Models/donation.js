const pool = require('../config/database');

class Donation {
    static async create(userId, eventId, amount, paymentMethod, transactionId = null) {
        const [result] = await pool.execute(
            'INSERT INTO donations (user_id, event_id, amount, payment_method, transaction_id) VALUES (?, ?, ?, ?, ?)',
            [userId, eventId, amount, paymentMethod, transactionId]
        );
        return result.insertId;
    }

    static async updateStatus(id, status) {
        await pool.execute(
            'UPDATE donations SET status = ? WHERE id = ?',
            [status, id]
        );
    }

    static async getByEventId(eventId) {
        const [rows] = await pool.execute(
            'SELECT d.*, u.email FROM donations d JOIN users u ON d.user_id = u.id WHERE d.event_id = ? ORDER BY d.created_at DESC',
            [eventId]
        );
        return rows;
    }
}

module.exports = Donation;