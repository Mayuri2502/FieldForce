const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

// Get customers
router.get('/', async (req, res) => {
  try {
    const { Customer } = require('../models');
    const { category, customer_type, assigned_employee_id, search } = req.query;
    
    const where = { company_id: req.companyId, is_active: true };
    if (category) where.category = category;
    if (customer_type) where.customer_type = customer_type;
    if (assigned_employee_id) where.assigned_employee_id = assigned_employee_id;
    if (search) {
      where[require('sequelize').Op.or] = [
        { name: { [require('sequelize').Op.iLike]: `%${search}%` } },
        { business_name: { [require('sequelize').Op.iLike]: `%${search}%` } },
        { phone: { [require('sequelize').Op.iLike]: `%${search}%` } },
        { email: { [require('sequelize').Op.iLike]: `%${search}%` } }
      ];
    }

    const customers = await Customer.findAll({
      where,
      include: [
        { model: require('../models').User, as: 'assignedEmployee' },
        { model: require('../models').Territory, as: 'territory' }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json({ success: true, data: { customers } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create customer
router.post('/', async (req, res) => {
  try {
    const { Customer } = require('../models');
    const customer = await Customer.create({
      ...req.body,
      company_id: req.companyId
    });

    res.status(201).json({ success: true, data: { customer } });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Get customer by ID
router.get('/:id', async (req, res) => {
  try {
    const { Customer } = require('../models');
    const customer = await Customer.findByPk(req.params.id, {
      include: [
        { model: require('../models').User, as: 'assignedEmployee' },
        { model: require('../models').Territory, as: 'territory' },
        { model: require('../models').CustomerHistory, as: 'history', order: [['created_at', 'DESC']] },
        { model: require('../models').FollowUp, as: 'followUps', where: { is_completed: false }, required: false },
        { model: require('../models').Visit, as: 'visits', order: [['scheduled_date', 'DESC']], limit: 10 }
      ]
    });

    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    res.json({ success: true, data: { customer } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update customer
router.put('/:id', async (req, res) => {
  try {
    const { Customer } = require('../models');
    const customer = await Customer.findByPk(req.params.id);

    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    Object.assign(customer, req.body);
    await customer.save();

    res.json({ success: true, data: { customer } });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Delete customer (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const { Customer } = require('../models');
    const customer = await Customer.findByPk(req.params.id);

    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    customer.is_active = false;
    await customer.save();

    res.json({ success: true, message: 'Customer deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
