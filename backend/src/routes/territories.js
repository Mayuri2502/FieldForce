const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

// Get territories
router.get('/', async (req, res) => {
  try {
    const { Territory } = require('../models');
    const { manager_id, is_active } = req.query;
    
    const where = { company_id: req.companyId };
    if (manager_id) where.manager_id = manager_id;
    if (is_active !== undefined) where.is_active = is_active;

    const territories = await Territory.findAll({
      where,
      include: [
        { model: require('../models').User, as: 'manager' }
      ],
      order: [['name', 'ASC']]
    });

    res.json({ success: true, data: { territories } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create territory
router.post('/', async (req, res) => {
  try {
    const { Territory } = require('../models');
    const territory = await Territory.create({
      ...req.body,
      company_id: req.companyId
    });

    res.status(201).json({ success: true, data: { territory } });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Get territory by ID
router.get('/:id', async (req, res) => {
  try {
    const { Territory } = require('../models');
    const territory = await Territory.findByPk(req.params.id, {
      include: [
        { model: require('../models').User, as: 'manager' },
        { model: require('../models').Geofence, as: 'geofences' },
        { model: require('../models').Customer, as: 'customers' }
      ]
    });

    if (!territory) {
      return res.status(404).json({ success: false, message: 'Territory not found' });
    }

    res.json({ success: true, data: { territory } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update territory
router.put('/:id', async (req, res) => {
  try {
    const { Territory } = require('../models');
    const territory = await Territory.findByPk(req.params.id);

    if (!territory) {
      return res.status(404).json({ success: false, message: 'Territory not found' });
    }

    Object.assign(territory, req.body);
    await territory.save();

    res.json({ success: true, data: { territory } });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Delete territory
router.delete('/:id', async (req, res) => {
  try {
    const { Territory } = require('../models');
    const territory = await Territory.findByPk(req.params.id);

    if (!territory) {
      return res.status(404).json({ success: false, message: 'Territory not found' });
    }

    await territory.destroy();

    res.json({ success: true, message: 'Territory deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
