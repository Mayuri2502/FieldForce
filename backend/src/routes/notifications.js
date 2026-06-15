const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

// Get notifications
router.get('/', async (req, res) => {
  try {
    const { Notification } = require('../models');
    const { is_read } = req.query;
    
    const where = { user_id: req.user.id };
    if (is_read !== undefined) where.is_read = is_read;

    const notifications = await Notification.findAll({
      where,
      order: [['created_at', 'DESC']],
      limit: 50
    });

    res.json({ success: true, data: { notifications } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Mark notification as read
router.put('/:id/read', async (req, res) => {
  try {
    const { Notification } = require('../models');
    const notification = await Notification.findByPk(req.params.id);

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    notification.is_read = true;
    notification.read_at = new Date();
    await notification.save();

    res.json({ success: true, data: { notification } });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Mark all notifications as read
router.put('/read-all', async (req, res) => {
  try {
    const { Notification } = require('../models');
    await Notification.update(
      { is_read: true, read_at: new Date() },
      { where: { user_id: req.user.id, is_read: false } }
    );

    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get notification preferences
router.get('/preferences/me', async (req, res) => {
  try {
    const { NotificationPreference } = require('../models');
    let preferences = await NotificationPreference.findOne({
      where: { user_id: req.user.id }
    });

    if (!preferences) {
      preferences = await NotificationPreference.create({ user_id: req.user.id });
    }

    res.json({ success: true, data: { preferences } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update notification preferences
router.put('/preferences/me', async (req, res) => {
  try {
    const { NotificationPreference } = require('../models');
    let preferences = await NotificationPreference.findOne({
      where: { user_id: req.user.id }
    });

    if (!preferences) {
      preferences = await NotificationPreference.create({
        user_id: req.user.id,
        ...req.body
      });
    } else {
      Object.assign(preferences, req.body);
      await preferences.save();
    }

    res.json({ success: true, data: { preferences } });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

module.exports = router;
