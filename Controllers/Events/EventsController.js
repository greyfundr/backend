const User = require('../models/User');
const Event = require('../models/Event');
const Donation = require('../models/Donation');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const axios = require('axios');

class EventController {
    // User authentication
    static async login(req, res) {
        try {
            const { email, password } = req.body;
            const user = await User.findByEmail(email);
            
            if (!user || !(await bcrypt.compare(password, user.password))) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }
            
            const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '24h' });
            res.json({ token, user: { id: user.id, email: user.email, wallet_balance: user.wallet_balance } });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async register(req, res) {
        try {
            const { email, password } = req.body;
            const userId = await User.create(email, password);
            res.status(201).json({ message: 'User created', userId });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // Event management
    static async getEvents(req, res) {
        try {
            const events = await Event.getAll();
            res.json(events);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async getEvent(req, res) {
        try {
            const event = await Event.findById(req.params.id);
            if (!event) return res.status(404).json({ error: 'Event not found' });
            
            const donations = await Donation.getByEventId(req.params.id);
            res.json({ ...event, donations });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // Donation handling
    static async donate(req, res) {
        try {
            const { eventId, amount, paymentMethod } = req.body;
            const userId = req.user.id;
            
            if (paymentMethod === 'wallet') {
                const user = await User.findById(userId);
                if (user.wallet_balance < amount) {
                    return res.status(400).json({ error: 'Insufficient wallet balance' });
                }
                
                // Deduct from wallet and update event
                await User.updateWalletBalance(userId, -amount);
                await Event.updateCurrentAmount(eventId, amount);
                
                // Create donation record
                const donationId = await Donation.create(userId, eventId, amount, 'wallet');
                await Donation.updateStatus(donationId, 'completed');
                
                res.json({ message: 'Donation successful', donationId });
            } else if (paymentMethod === 'paystack') {
                // Initialize Paystack transaction
                const response = await axios.post('https://api.paystack.co/transaction/initialize', {
                    email: req.user.email,
                    amount: amount * 100, // Paystack expects amount in kobo
                    callback_url: `${process.env.BASE_URL}/events/${eventId}/donate/callback`
                }, {
                    headers: {
                        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                // Create pending donation record
                const donationId = await Donation.create(userId, eventId, amount, 'paystack', response.data.data.reference);
                
                res.json({ 
                    message: 'Payment initialized', 
                    paymentUrl: response.data.data.authorization_url,
                    donationId 
                });
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // Paystack callback
    static async paystackCallback(req, res) {
        try {
            const { reference } = req.query;
            
            // Verify transaction with Paystack
            const response = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
                headers: {
                    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
                }
            });
            
            if (response.data.data.status === 'success') {
                // Update donation status and event amount
                const donation = await pool.execute(
                    'SELECT * FROM donations WHERE transaction_id = ?',
                    [reference]
                );
                
                if (donation[0].length > 0) {
                    await Donation.updateStatus(donation[0][0].id, 'completed');
                    await Event.updateCurrentAmount(donation[0][0].event_id, donation[0][0].amount);
                }
                
                res.redirect(`/events/${donation[0][0].event_id}?success=true`);
            } else {
                res.redirect(`/events/${donation[0][0].event_id}?success=false`);
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // Middleware to verify JWT
    static authenticateToken(req, res, next) {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        
        if (!token) return res.status(401).json({ error: 'Access token required' });
        
        jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
            if (err) return res.status(403).json({ error: 'Invalid token' });
            req.user = user;
            next();
        });
    }
}

module.exports = EventController;