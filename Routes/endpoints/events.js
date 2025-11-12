const express = require('express');
const router = express.Router();
const EventController = require('../Controllers/EventController');

// Public routes
router.post('/login', EventController.login);
router.post('/register', EventController.register);
router.get('/events', EventController.getEvents);
router.get('/events/:id', EventController.getEvent);

// Protected routes
router.post('/events/:id/donate', EventController.authenticateToken, EventController.donate);
router.get('/events/:id/donate/callback', EventController.paystackCallback);

module.exports = router;