const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

// Get subscription
router.get('/company', async (req, res) => {
  try {
    const { Subscription, Company } = require('../models');
    
    const subscription = await Subscription.findOne({
      where: { company_id: req.companyId },
      order: [['created_at', 'DESC']]
    });

    const company = await Company.findByPk(req.companyId);

    res.json({ success: true, data: { subscription, company } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create subscription (super admin only)
router.post('/', authorize('super_admin'), async (req, res) => {
  try {
    const { Subscription } = require('../models');
    const subscription = await Subscription.create(req.body);

    res.status(201).json({ success: true, data: { subscription } });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Update subscription
router.put('/:id', authorize('super_admin'), async (req, res) => {
  try {
    const { Subscription } = require('../models');
    const subscription = await Subscription.findByPk(req.params.id);

    if (!subscription) {
      return res.status(404).json({ success: false, message: 'Subscription not found' });
    }

    Object.assign(subscription, req.body);
    await subscription.save();

    res.json({ success: true, data: { subscription } });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

module.exports = router;
