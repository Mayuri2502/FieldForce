const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

// Get company by ID
router.get('/:id', async (req, res) => {
  try {
    const { Company } = require('../models');
    const company = await Company.findByPk(req.params.id);

    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found' });
    }

    res.json({ success: true, data: { company } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update company (company admin only)
router.put('/:id', authorize('company_admin'), async (req, res) => {
  try {
    const { Company } = require('../models');
    const company = await Company.findByPk(req.params.id);

    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found' });
    }

    Object.assign(company, req.body);
    await company.save();

    res.json({ success: true, data: { company } });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Get all companies (super admin only)
router.get('/', authorize('super_admin'), async (req, res) => {
  try {
    const { Company } = require('../models');
    const companies = await Company.findAll({
      order: [['created_at', 'DESC']]
    });

    res.json({ success: true, data: { companies } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create company (super admin only)
router.post('/', authorize('super_admin'), async (req, res) => {
  try {
    const { Company } = require('../models');
    const company = await Company.create(req.body);

    res.status(201).json({ success: true, data: { company } });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

module.exports = router;
