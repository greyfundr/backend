const express = require('express');
const router = express.Router();
const {
  getNotifications,
  getNotification,
  createNotification ,
  updateNotification ,
  deleteNotification ,
} = require('../../Controllers/Notifications/NotifyController');


router.use(express.urlencoded({ extended: true }));

// GET /api/notifications/:userId - Get all notifications for a user
router.get('/notifications/:userId', getNotifications);
// GET /api/notifications/single/:id - Get a single notification
router.get('/notifications/single/:id', getNotification);
// POST /api/notifications - Create a new notification
router.post('/notifications', createNotification);
// PUT /api/notifications/:id - Update a notification
router.put('/notifications/:id', updateNotification);
// DELETE /api/notifications/:id - Delete a notification
router.delete('/notifications/:id', deleteNotification);
module.exports = router;