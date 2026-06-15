const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

// Get attendance records
router.get('/', async (req, res) => {
  try {
    const { Attendance } = require('../models');
    const { date, employee_id, status } = req.query;
    
    const where = { company_id: req.companyId };
    if (date) where.date = date;
    if (employee_id) where.employee_id = employee_id;
    if (status) where.status = status;

    const attendance = await Attendance.findAll({
      where,
      include: [
        { model: require('../models').User, as: 'employee' },
        { model: require('../models').Shift, as: 'shift' }
      ],
      order: [['date', 'DESC']]
    });

    res.json({ success: true, data: { attendance } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Check in
router.post('/check-in', async (req, res) => {
  try {
    const { Attendance } = require('../models');
    const { latitude, longitude, accuracy, selfie_url, device_info } = req.body;

    // Check if already checked in today
    const today = new Date().toISOString().split('T')[0];
    const existingAttendance = await Attendance.findOne({
      where: {
        employee_id: req.user.id,
        date: today
      }
    });

    if (existingAttendance) {
      return res.status(400).json({ success: false, message: 'Already checked in today' });
    }

    const attendance = await Attendance.create({
      employee_id: req.user.id,
      company_id: req.companyId,
      date: today,
      check_in_time: new Date(),
      check_in_latitude: latitude,
      check_in_longitude: longitude,
      check_in_accuracy: accuracy,
      check_in_selfie_url: selfie_url,
      check_in_device_info: device_info,
      status: 'present'
    });

    res.status(201).json({ success: true, data: { attendance } });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Check out
router.post('/check-out', async (req, res) => {
  try {
    const { Attendance } = require('../models');
    const { latitude, longitude, accuracy, device_info } = req.body;

    const today = new Date().toISOString().split('T')[0];
    const attendance = await Attendance.findOne({
      where: {
        employee_id: req.user.id,
        date: today,
        check_out_time: null
      }
    });

    if (!attendance) {
      return res.status(404).json({ success: false, message: 'No active check-in found' });
    }

    const checkOutTime = new Date();
    
    // Validate check-out time is after check-in time
    if (new Date(attendance.check_in_time) >= checkOutTime) {
      return res.status(400).json({ success: false, message: 'Check-out time must be after check-in time' });
    }

    attendance.check_out_time = checkOutTime;
    attendance.check_out_latitude = latitude;
    attendance.check_out_longitude = longitude;
    attendance.check_out_accuracy = accuracy;
    attendance.check_out_device_info = device_info;
    
    // Calculate work hours
    const checkIn = new Date(attendance.check_in_time);
    const checkOut = new Date(attendance.check_out_time);
    attendance.work_hours = (checkOut - checkIn) / (1000 * 60 * 60);

    await attendance.save();

    res.json({ success: true, data: { attendance } });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Get attendance by ID
router.get('/:id', async (req, res) => {
  try {
    const { Attendance } = require('../models');
    const attendance = await Attendance.findByPk(req.params.id, {
      include: [
        { model: require('../models').User, as: 'employee' },
        { model: require('../models').Shift, as: 'shift' }
      ]
    });

    if (!attendance) {
      return res.status(404).json({ success: false, message: 'Attendance not found' });
    }

    res.json({ success: true, data: { attendance } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
