const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

// Get visits
router.get('/', async (req, res) => {
  try {
    const { Visit } = require('../models');
    const { status, type, employee_id, customer_id, date_from, date_to } = req.query;
    
    const where = { company_id: req.companyId };
    if (status) where.status = status;
    if (type) where.type = type;
    if (employee_id) where.employee_id = employee_id;
    if (customer_id) where.customer_id = customer_id;
    if (date_from && date_to) {
      where.scheduled_date = {
        [require('sequelize').Op.between]: [new Date(date_from), new Date(date_to)]
      };
    }

    const visits = await Visit.findAll({
      where,
      include: [
        { model: require('../models').User, as: 'employee' },
        { model: require('../models').Customer, as: 'customer' },
        { model: require('../models').Task, as: 'task' }
      ],
      order: [['scheduled_date', 'DESC']]
    });

    res.json({ success: true, data: { visits } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create visit
router.post('/', async (req, res) => {
  try {
    const { Visit, Customer } = require('../models');
    const { customer_id } = req.body;

    // Validate customer_id exists and belongs to the same company
    if (customer_id) {
      const customer = await Customer.findByPk(customer_id);
      if (!customer) {
        return res.status(400).json({ success: false, message: 'Customer not found' });
      }
      if (customer.company_id !== req.companyId && req.user.role !== 'super_admin') {
        return res.status(403).json({ success: false, message: 'Cannot visit customer from different company' });
      }
    }

    const visit = await Visit.create({
      ...req.body,
      company_id: req.companyId,
      employee_id: req.user.id
    });

    res.status(201).json({ success: true, data: { visit } });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Start visit
router.post('/:id/start', async (req, res) => {
  try {
    const { Visit } = require('../models');
    const { latitude, longitude } = req.body;

    const visit = await Visit.findByPk(req.params.id);
    if (!visit) {
      return res.status(404).json({ success: false, message: 'Visit not found' });
    }

    visit.status = 'in_progress';
    visit.start_time = new Date();
    visit.start_latitude = latitude;
    visit.start_longitude = longitude;
    await visit.save();

    res.json({ success: true, data: { visit } });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// End visit
router.post('/:id/end', async (req, res) => {
  try {
    const { Visit } = require('../models');
    const { latitude, longitude, notes, photos, outcome, is_productive } = req.body;

    const visit = await Visit.findByPk(req.params.id);
    if (!visit) {
      return res.status(404).json({ success: false, message: 'Visit not found' });
    }

    visit.status = 'completed';
    visit.end_time = new Date();
    visit.end_latitude = latitude;
    visit.end_longitude = longitude;
    visit.notes = notes;
    visit.photos = photos;
    visit.outcome = outcome;
    visit.is_productive = is_productive;
    
    // Calculate duration
    if (visit.start_time) {
      const start = new Date(visit.start_time);
      const end = new Date(visit.end_time);
      visit.duration_minutes = Math.round((end - start) / (1000 * 60));
    }

    await visit.save();

    res.json({ success: true, data: { visit } });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Get visit by ID
router.get('/:id', async (req, res) => {
  try {
    const { Visit } = require('../models');
    const visit = await Visit.findByPk(req.params.id, {
      include: [
        { model: require('../models').User, as: 'employee' },
        { model: require('../models').Customer, as: 'customer' },
        { model: require('../models').Task, as: 'task' }
      ]
    });

    if (!visit) {
      return res.status(404).json({ success: false, message: 'Visit not found' });
    }

    res.json({ success: true, data: { visit } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
