const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

// Get leaves
router.get('/', async (req, res) => {
  try {
    const { Leave } = require('../models');
    const { status, type, employee_id, date_from, date_to } = req.query;
    
    const where = { company_id: req.companyId };
    if (status) where.status = status;
    if (type) where.type = type;
    if (employee_id) where.employee_id = employee_id;
    if (date_from && date_to) {
      where.start_date = {
        [require('sequelize').Op.between]: [new Date(date_from), new Date(date_to)]
      };
    }

    const leaves = await Leave.findAll({
      where,
      include: [
        { model: require('../models').User, as: 'employee' },
        { model: require('../models').User, as: 'approver' }
      ],
      order: [['start_date', 'DESC']]
    });

    res.json({ success: true, data: { leaves } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create leave request
router.post('/', async (req, res) => {
  try {
    const { Leave } = require('../models');
    const leave = await Leave.create({
      ...req.body,
      company_id: req.companyId,
      employee_id: req.user.id
    });

    res.status(201).json({ success: true, data: { leave } });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Approve leave
router.post('/:id/approve', async (req, res) => {
  try {
    const { Leave } = require('../models');
    const leave = await Leave.findByPk(req.params.id);

    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave not found' });
    }

    leave.status = 'approved';
    leave.approved_by = req.user.id;
    leave.approved_at = new Date();
    await leave.save();

    // Update leave balance
    const { LeaveBalance } = require('../models');
    const balance = await LeaveBalance.findOne({
      where: {
        employee_id: leave.employee_id,
        leave_type: leave.type,
        year: new Date().getFullYear()
      }
    });

    if (balance) {
      balance.used_days += leave.total_days;
      balance.remaining_days -= leave.total_days;
      await balance.save();
    }

    // Send notification
    const notificationService = require('../services/notificationService');
    await notificationService.sendInAppNotification(leave.employee_id, {
      company_id: req.companyId,
      type: 'leave_approved',
      title: 'Leave Approved',
      message: `Your leave request has been approved`,
      data: { leave_id: leave.id }
    });

    res.json({ success: true, data: { leave } });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Reject leave
router.post('/:id/reject', async (req, res) => {
  try {
    const { Leave } = require('../models');
    const { rejection_reason } = req.body;

    const leave = await Leave.findByPk(req.params.id);

    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave not found' });
    }

    leave.status = 'rejected';
    leave.rejected_by = req.user.id;
    leave.rejected_at = new Date();
    leave.rejection_reason = rejection_reason;
    await leave.save();

    // Send notification
    const notificationService = require('../services/notificationService');
    await notificationService.sendInAppNotification(leave.employee_id, {
      company_id: req.companyId,
      type: 'leave_rejected',
      title: 'Leave Rejected',
      message: `Your leave request has been rejected`,
      data: { leave_id: leave.id, rejection_reason }
    });

    res.json({ success: true, data: { leave } });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Get leave balance
router.get('/balance/:employeeId', async (req, res) => {
  try {
    const { LeaveBalance } = require('../models');
    const balances = await LeaveBalance.findAll({
      where: {
        employee_id: req.params.employeeId,
        year: new Date().getFullYear()
      }
    });

    res.json({ success: true, data: { balances } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
