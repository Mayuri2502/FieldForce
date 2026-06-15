const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

// Get expenses
router.get('/', async (req, res) => {
  try {
    const { Expense } = require('../models');
    const { status, type, employee_id, date_from, date_to } = req.query;
    
    const where = { company_id: req.companyId };
    if (status) where.status = status;
    if (type) where.type = type;
    if (employee_id) where.employee_id = employee_id;
    if (date_from && date_to) {
      where.expense_date = {
        [require('sequelize').Op.between]: [new Date(date_from), new Date(date_to)]
      };
    }

    const expenses = await Expense.findAll({
      where,
      include: [
        { model: require('../models').User, as: 'employee' },
        { model: require('../models').User, as: 'approver' }
      ],
      order: [['expense_date', 'DESC']]
    });

    res.json({ success: true, data: { expenses } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create expense
router.post('/', async (req, res) => {
  try {
    const { Expense } = require('../models');
    const expense = await Expense.create({
      ...req.body,
      company_id: req.companyId,
      employee_id: req.user.id
    });

    res.status(201).json({ success: true, data: { expense } });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Approve expense
router.post('/:id/approve', async (req, res) => {
  try {
    const { Expense } = require('../models');
    const expense = await Expense.findByPk(req.params.id);

    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }

    expense.status = 'approved';
    expense.approved_by = req.user.id;
    expense.approved_at = new Date();
    await expense.save();

    // Send notification
    const notificationService = require('../services/notificationService');
    await notificationService.sendInAppNotification(expense.employee_id, {
      company_id: req.companyId,
      type: 'expense_approved',
      title: 'Expense Approved',
      message: `Your expense of ${expense.amount} has been approved`,
      data: { expense_id: expense.id }
    });

    res.json({ success: true, data: { expense } });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Reject expense
router.post('/:id/reject', async (req, res) => {
  try {
    const { Expense } = require('../models');
    const { rejection_reason } = req.body;

    const expense = await Expense.findByPk(req.params.id);

    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }

    expense.status = 'rejected';
    expense.rejected_by = req.user.id;
    expense.rejected_at = new Date();
    expense.rejection_reason = rejection_reason;
    await expense.save();

    // Send notification
    const notificationService = require('../services/notificationService');
    await notificationService.sendInAppNotification(expense.employee_id, {
      company_id: req.companyId,
      type: 'expense_rejected',
      title: 'Expense Rejected',
      message: `Your expense of ${expense.amount} has been rejected`,
      data: { expense_id: expense.id, rejection_reason }
    });

    res.json({ success: true, data: { expense } });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

module.exports = router;
