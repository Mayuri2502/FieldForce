const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

// Get device status
router.get('/status/:employeeId', async (req, res) => {
  try {
    const { DeviceStatus } = require('../models');
    const deviceStatus = await DeviceStatus.findOne({
      where: { employee_id: req.params.employeeId },
      order: [['updated_at', 'DESC']]
    });

    if (!deviceStatus) {
      return res.status(404).json({ success: false, message: 'Device status not found' });
    }

    res.json({ success: true, data: { device_status: deviceStatus } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update device status
router.post('/status', async (req, res) => {
  try {
    const { DeviceStatus } = require('../models');
    
    let deviceStatus = await DeviceStatus.findOne({
      where: { employee_id: req.user.id }
    });

    if (deviceStatus) {
      Object.assign(deviceStatus, req.body);
      deviceStatus.last_active_time = new Date();
      await deviceStatus.save();
    } else {
      deviceStatus = await DeviceStatus.create({
        ...req.body,
        employee_id: req.user.id,
        last_active_time: new Date()
      });
    }

    // Check for alerts
    if (req.body.battery_level && req.body.battery_level < 20) {
      const { DeviceAlert } = require('../models');
      await DeviceAlert.create({
        employee_id: req.user.id,
        company_id: req.companyId,
        alert_type: 'battery_low',
        message: 'Battery level is critically low',
        severity: 'warning'
      });
    }

    if (req.body.gps_enabled === false) {
      const { DeviceAlert } = require('../models');
      await DeviceAlert.create({
        employee_id: req.user.id,
        company_id: req.companyId,
        alert_type: 'gps_disabled',
        message: 'GPS is disabled',
        severity: 'error'
      });
    }

    res.json({ success: true, data: { device_status: deviceStatus } });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Get device alerts
router.get('/alerts', async (req, res) => {
  try {
    const { DeviceAlert } = require('../models');
    const { employee_id, is_resolved } = req.query;
    
    const where = { company_id: req.companyId };
    if (employee_id) where.employee_id = employee_id;
    if (is_resolved !== undefined) where.is_resolved = is_resolved;

    const alerts = await DeviceAlert.findAll({
      where,
      include: [
        { model: require('../models').User, as: 'employee' }
      ],
      order: [['created_at', 'DESC']],
      limit: 100
    });

    res.json({ success: true, data: { alerts } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Resolve alert
router.put('/alerts/:id/resolve', async (req, res) => {
  try {
    const { DeviceAlert } = require('../models');
    const alert = await DeviceAlert.findByPk(req.params.id);

    if (!alert) {
      return res.status(404).json({ success: false, message: 'Alert not found' });
    }

    alert.is_resolved = true;
    alert.resolved_at = new Date();
    await alert.save();

    res.json({ success: true, data: { alert } });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

module.exports = router;
