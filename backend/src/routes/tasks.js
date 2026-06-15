const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

// Get tasks
router.get('/', async (req, res) => {
  try {
    const { Task } = require('../models');
    const { status, priority, type, assigned_to, due_date_from, due_date_to } = req.query;
    
    const where = { company_id: req.companyId };
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (type) where.type = type;
    if (assigned_to) where.assigned_to = assigned_to;
    if (due_date_from && due_date_to) {
      where.due_date = {
        [require('sequelize').Op.between]: [new Date(due_date_from), new Date(due_date_to)]
      };
    }

    const tasks = await Task.findAll({
      where,
      include: [
        { model: require('../models').User, as: 'assignee' },
        { model: require('../models').User, as: 'assigner' },
        { model: require('../models').Customer, as: 'customer' }
      ],
      order: [['due_date', 'ASC']]
    });

    res.json({ success: true, data: { tasks } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create task
router.post('/', async (req, res) => {
  try {
    const { Task, User } = require('../models');
    const { assigned_to, customer_id } = req.body;

    // Validate assigned_to user exists and belongs to the same company
    if (assigned_to) {
      const assignee = await User.findByPk(assigned_to);
      if (!assignee) {
        return res.status(400).json({ success: false, message: 'Assigned user not found' });
      }
      if (assignee.company_id !== req.companyId && req.user.role !== 'super_admin') {
        return res.status(403).json({ success: false, message: 'Cannot assign user from different company' });
      }
    }

    // Validate customer_id exists and belongs to the same company
    if (customer_id) {
      const { Customer } = require('../models');
      const customer = await Customer.findByPk(customer_id);
      if (!customer) {
        return res.status(400).json({ success: false, message: 'Customer not found' });
      }
      if (customer.company_id !== req.companyId && req.user.role !== 'super_admin') {
        return res.status(403).json({ success: false, message: 'Cannot use customer from different company' });
      }
    }

    const task = await Task.create({
      ...req.body,
      company_id: req.companyId,
      assigned_by: req.user.id
    });

    // Send notification to assignee
    const notificationService = require('../services/notificationService');
    await notificationService.sendInAppNotification(task.assigned_to, {
      company_id: req.companyId,
      type: 'task_assigned',
      title: 'New Task Assigned',
      message: `You have been assigned a new task: ${task.title}`,
      data: { task_id: task.id }
    });

    res.status(201).json({ success: true, data: { task } });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Get task by ID
router.get('/:id', async (req, res) => {
  try {
    const { Task } = require('../models');
    const task = await Task.findByPk(req.params.id, {
      include: [
        { model: require('../models').User, as: 'assignee' },
        { model: require('../models').User, as: 'assigner' },
        { model: require('../models').Customer, as: 'customer' },
        { model: require('../models').TaskComment, as: 'comments', include: [{ model: require('../models').User, as: 'user' }] }
      ]
    });

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    res.json({ success: true, data: { task } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update task
router.put('/:id', async (req, res) => {
  try {
    const { Task } = require('../models');
    const task = await Task.findByPk(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    Object.assign(task, req.body);
    
    if (req.body.status === 'completed' && !task.completion_date) {
      task.completion_date = new Date();
    }

    await task.save();

    res.json({ success: true, data: { task } });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Delete task
router.delete('/:id', async (req, res) => {
  try {
    const { Task } = require('../models');
    const task = await Task.findByPk(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    await task.destroy();

    res.json({ success: true, message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Add comment to task
router.post('/:id/comments', async (req, res) => {
  try {
    const { TaskComment } = require('../models');
    const comment = await TaskComment.create({
      task_id: req.params.id,
      user_id: req.user.id,
      comment: req.body.comment,
      attachments: req.body.attachments || []
    });

    res.status(201).json({ success: true, data: { comment } });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

module.exports = router;
