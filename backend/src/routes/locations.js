const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

// Update location
router.post('/update', async (req, res) => {
  try {
    const { LocationHistory } = require('../models');
    const { latitude, longitude, accuracy, altitude, speed, heading, battery_level, is_charging, network_type, gps_status, device_info } = req.body;

    const location = await LocationHistory.create({
      employee_id: req.user.id,
      company_id: req.companyId,
      latitude,
      longitude,
      accuracy,
      altitude,
      speed,
      heading,
      battery_level,
      is_charging,
      network_type,
      gps_status,
      timestamp: new Date(),
      device_info
    });

    // Emit real-time location update via Socket.IO
    if (global.io) {
      global.io.to(`company-${req.companyId}`).emit('employee-location', {
        employee_id: req.user.id,
        latitude,
        longitude,
        timestamp: new Date()
      });
    }

    res.status(201).json({ success: true, data: { location } });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Get location history
router.get('/history/:employeeId', async (req, res) => {
  try {
    const { LocationHistory } = require('../models');
    const { start_date, end_date } = req.query;
    
    const where = { employee_id: req.params.employeeId, company_id: req.companyId };
    if (start_date && end_date) {
      where.timestamp = {
        [require('sequelize').Op.between]: [new Date(start_date), new Date(end_date)]
      };
    }

    const locations = await LocationHistory.findAll({
      where,
      order: [['timestamp', 'ASC']],
      limit: 1000
    });

    res.json({ success: true, data: { locations } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get current location of all employees
router.get('/live', async (req, res) => {
  try {
    const { LocationHistory, User } = require('../models');
    
    const users = await User.findAll({
      where: { company_id: req.companyId, role: ['employee', 'manager'], is_active: true },
      attributes: ['id', 'first_name', 'last_name', 'role']
    });

    const locations = await Promise.all(
      users.map(async (user) => {
        const latestLocation = await LocationHistory.findOne({
          where: { employee_id: user.id },
          order: [['timestamp', 'DESC']]
        });
        return {
          user,
          location: latestLocation
        };
      })
    );

    res.json({ success: true, data: { locations } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
