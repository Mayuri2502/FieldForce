const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

// Get forms
router.get('/', async (req, res) => {
  try {
    const { Form } = require('../models');
    const { form_type, is_active } = req.query;
    
    const where = { company_id: req.companyId };
    if (form_type) where.form_type = form_type;
    if (is_active !== undefined) where.is_active = is_active;

    const forms = await Form.findAll({
      where,
      order: [['name', 'ASC']]
    });

    res.json({ success: true, data: { forms } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create form
router.post('/', async (req, res) => {
  try {
    const { Form } = require('../models');
    const form = await Form.create({
      ...req.body,
      company_id: req.companyId,
      created_by: req.user.id
    });

    res.status(201).json({ success: true, data: { form } });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Get form by ID
router.get('/:id', async (req, res) => {
  try {
    const { Form } = require('../models');
    const form = await Form.findByPk(req.params.id);

    if (!form) {
      return res.status(404).json({ success: false, message: 'Form not found' });
    }

    res.json({ success: true, data: { form } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Submit form
router.post('/:id/submit', async (req, res) => {
  try {
    const { FormSubmission } = require('../models');
    const submission = await FormSubmission.create({
      form_id: req.params.id,
      employee_id: req.user.id,
      submission_data: req.body.submission_data,
      attachments: req.body.attachments || [],
      latitude: req.body.latitude,
      longitude: req.body.longitude,
      customer_id: req.body.customer_id,
      task_id: req.body.task_id
    });

    res.status(201).json({ success: true, data: { submission } });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

module.exports = router;
