const pool = require('../config/database');

class Event {
    static async create(title, description, organizerId, targetAmount) {
        const [result] = await pool.execute(
            'INSERT INTO events (title, description, organizer_id, target_amount) VALUES (?, ?, ?, ?)',
            [title, description, organizerId, targetAmount]
        );
        return result.insertId;
    }

    static async findById(id) {
        const [rows] = await pool.execute(
            'SELECT * FROM events WHERE id = ?',
            [id]
        );
        return rows[0];
    }

    static async getAll() {
        const [rows] = await pool.execute('SELECT * FROM events');
        return rows;
    }

    static async updateCurrentAmount(id, amount) {
        await pool.execute(
            'UPDATE events SET current_amount = current_amount + ? WHERE id = ?',
            [amount, id]
        );
    }
}

module.exports = Event;