const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

// Get beats
router.get('/', async (req, res) => {
  try {
    const { Beat } = require('../models');
    const { territory_id, assigned_employee_id, is_active } = req.query;
    
    const where = { company_id: req.companyId };
    if (territory_id) where.territory_id = territory_id;
    if (assigned_employee_id) where.assigned_employee_id = assigned_employee_id;
    if (is_active !== undefined) where.is_active = is_active;

    const beats = await Beat.findAll({
      where,
      include: [
        { model: require('../models').Territory, as: 'territory' },
        { model: require('../models').User, as: 'assignedEmployee' },
        { model: require('../models').User, as: 'manager' }
      ],
      order: [['name', 'ASC']]
    });

    res.json({ success: true, data: { beats } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create beat
router.post('/', async (req, res) => {
  try {
    const { Beat } = require('../models');
    const beat = await Beat.create({
      ...req.body,
      company_id: req.companyId
    });

    res.status(201).json({ success: true, data: { beat } });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Get beat by ID
router.get('/:id', async (req, res) => {
  try {
    const { Beat } = require('../models');
    const beat = await Beat.findByPk(req.params.id, {
      include: [
        { model: require('../models').Territory, as: 'territory' },
        { model: require('../models').User, as: 'assignedEmployee' },
        { model: require('../models').User, as: 'manager' },
        { model: require('../models').BeatCustomer, as: 'beatCustomers', include: [{ model: require('../models').Customer, as: 'customer' }] }
      ]
    });

    if (!beat) {
      return res.status(404).json({ success: false, message: 'Beat not found' });
    }

    res.json({ success: true, data: { beat } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update beat
router.put('/:id', async (req, res) => {
  try {
    const { Beat } = require('../models');
    const beat = await Beat.findByPk(req.params.id);

    if (!beat) {
      return res.status(404).json({ success: false, message: 'Beat not found' });
    }

    Object.assign(beat, req.body);
    await beat.save();

    res.json({ success: true, data: { beat } });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Delete beat
router.delete('/:id', async (req, res) => {
  try {
    const { Beat } = require('../models');
    const beat = await Beat.findByPk(req.params.id);

    if (!beat) {
      return res.status(404).json({ success: false, message: 'Beat not found' });
    }

    await beat.destroy();

    res.json({ success: true, message: 'Beat deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
