const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

// Get all users (company admin and manager only)
router.get('/', authorize('company_admin', 'manager'), async (req, res) => {
  try {
    const { User } = require('../models');
    const { role, department, search } = req.query;
    
    const where = { company_id: req.companyId, is_deleted: false };
    if (role) where.role = role;
    if (department) where.department = department;
    if (search) {
      where[require('sequelize').Op.or] = [
        { first_name: { [require('sequelize').Op.iLike]: `%${search}%` } },
        { last_name: { [require('sequelize').Op.iLike]: `%${search}%` } },
        { email: { [require('sequelize').Op.iLike]: `%${search}%` } }
      ];
    }

    const users = await User.findAll({
      where,
      attributes: { exclude: ['password_hash'] },
      order: [['created_at', 'DESC']]
    });

    res.json({ success: true, data: { users } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const { User } = require('../models');
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password_hash'] },
      include: [
        { model: require('../models').Company, as: 'company' },
        { model: require('../models').User, as: 'manager' }
      ]
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check company access
    if (user.company_id !== req.companyId && req.user.role !== 'super_admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.json({ success: true, data: { user } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create user (company admin only)
router.post('/', authorize('company_admin'), async (req, res) => {
  try {
    const { User } = require('../models');
    const user = new User();
    Object.assign(user, req.body);
    await user.hashPassword(req.body.password);
    user.company_id = req.companyId;
    await user.save();

    res.status(201).json({ success: true, data: { user: user.toJSON() } });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Update user
router.put('/:id', authorize('company_admin', 'manager'), async (req, res) => {
  try {
    const { User } = require('../models');
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check company access
    if (user.company_id !== req.companyId && req.user.role !== 'super_admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    // Allow only specific fields to be updated
    const allowedFields = ['first_name', 'last_name', 'phone', 'department', 'designation', 'manager_id', 'territory_id', 'date_of_birth', 'gender', 'address', 'city', 'state', 'country', 'postal_code', 'emergency_contact_name', 'emergency_contact_phone', 'is_active'];
    
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        user[field] = req.body[field];
      }
    });

    await user.save();

    res.json({ success: true, data: { user: user.toJSON() } });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Delete user (soft delete)
router.delete('/:id', authorize('company_admin'), async (req, res) => {
  try {
    const { User } = require('../models');
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check company access
    if (user.company_id !== req.companyId && req.user.role !== 'super_admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    user.is_deleted = true;
    await user.save();

    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

module.exports = router;
