const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

// Get geofences
router.get('/', async (req, res) => {
  try {
    const { Geofence } = require('../models');
    const { territory_id, type, is_active } = req.query;
    
    const where = { company_id: req.companyId };
    if (territory_id) where.territory_id = territory_id;
    if (type) where.type = type;
    if (is_active !== undefined) where.is_active = is_active;

    const geofences = await Geofence.findAll({
      where,
      include: [
        { model: require('../models').Territory, as: 'territory' }
      ],
      order: [['name', 'ASC']]
    });

    res.json({ success: true, data: { geofences } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create geofence
router.post('/', async (req, res) => {
  try {
    const { Geofence } = require('../models');
    const geofence = await Geofence.create({
      ...req.body,
      company_id: req.companyId
    });

    res.status(201).json({ success: true, data: { geofence } });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Get geofence by ID
router.get('/:id', async (req, res) => {
  try {
    const { Geofence } = require('../models');
    const geofence = await Geofence.findByPk(req.params.id, {
      include: [
        { model: require('../models').Territory, as: 'territory' }
      ]
    });

    if (!geofence) {
      return res.status(404).json({ success: false, message: 'Geofence not found' });
    }

    res.json({ success: true, data: { geofence } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update geofence
router.put('/:id', async (req, res) => {
  try {
    const { Geofence } = require('../models');
    const geofence = await Geofence.findByPk(req.params.id);

    if (!geofence) {
      return res.status(404).json({ success: false, message: 'Geofence not found' });
    }

    Object.assign(geofence, req.body);
    await geofence.save();

    res.json({ success: true, data: { geofence } });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Delete geofence
router.delete('/:id', async (req, res) => {
  try {
    const { Geofence } = require('../models');
    const geofence = await Geofence.findByPk(req.params.id);

    if (!geofence) {
      return res.status(404).json({ success: false, message: 'Geofence not found' });
    }

    await geofence.destroy();

    res.json({ success: true, message: 'Geofence deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
