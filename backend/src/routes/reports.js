const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

// Get reports
router.get('/', async (req, res) => {
  try {
    const { Report } = require('../models');
    const { report_type, status } = req.query;
    
    const where = { company_id: req.companyId };
    if (report_type) where.report_type = report_type;
    if (status) where.status = status;

    const reports = await Report.findAll({
      where,
      include: [
        { model: require('../models').User, as: 'generator' }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json({ success: true, data: { reports } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Generate report
router.post('/', async (req, res) => {
  try {
    const { Report } = require('../models');
    const report = await Report.create({
      ...req.body,
      company_id: req.companyId,
      generated_by: req.user.id,
      status: 'processing'
    });

    // TODO: Implement actual report generation logic
    // This would typically be handled by a background job

    res.status(201).json({ success: true, data: { report } });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Get report by ID
router.get('/:id', async (req, res) => {
  try {
    const { Report } = require('../models');
    const report = await Report.findByPk(req.params.id);

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    res.json({ success: true, data: { report } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
