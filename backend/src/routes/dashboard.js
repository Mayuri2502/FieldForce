const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { sequelize } = require('../models');

router.use(authenticate);

// Get dashboard statistics
router.get('/stats', async (req, res) => {
  try {
    const { User, Attendance, Task, Visit, Order, Customer } = require('../models');
    const { date } = req.query;
    const targetDate = date || new Date();

    // Get employee count
    const totalEmployees = await User.count({
      where: {
        company_id: req.companyId,
        role: ['employee', 'manager'],
        is_active: true,
        is_deleted: false
      }
    });

    // Get present employees today
    const presentEmployees = await Attendance.count({
      where: {
        company_id: req.companyId,
        date: targetDate,
        status: 'present'
      }
    });

    // Get completed tasks today
    const completedTasks = await Task.count({
      where: {
        company_id: req.companyId,
        status: 'completed',
        completion_date: {
          [require('sequelize').Op.gte]: new Date(new Date(targetDate).setHours(0, 0, 0, 0))
        }
      }
    });

    // Get completed visits today
    const completedVisits = await Visit.count({
      where: {
        company_id: req.companyId,
        status: 'completed',
        end_time: {
          [require('sequelize').Op.gte]: new Date(new Date(targetDate).setHours(0, 0, 0, 0))
        }
      }
    });

    // Get orders today
    const ordersToday = await Order.count({
      where: {
        company_id: req.companyId,
        order_date: {
          [require('sequelize').Op.gte]: new Date(new Date(targetDate).setHours(0, 0, 0, 0))
        }
      }
    });

    // Get total customers
    const totalCustomers = await Customer.count({
      where: {
        company_id: req.companyId,
        is_active: true
      }
    });

    // Get revenue today
    const revenueResult = await Order.findOne({
      attributes: [
        [sequelize.fn('COALESCE', sequelize.fn('SUM', sequelize.col('total_amount')), 0), 'total']
      ],
      where: {
        company_id: req.companyId,
        order_date: {
          [require('sequelize').Op.gte]: new Date(new Date(targetDate).setHours(0, 0, 0, 0))
        },
        status: ['approved', 'delivered']
      }
    });

    res.json({
      success: true,
      data: {
        stats: {
          total_employees: totalEmployees,
          present_employees: presentEmployees,
          completed_tasks: completedTasks,
          completed_visits: completedVisits,
          orders_today: ordersToday,
          total_customers: totalCustomers,
          revenue_today: parseFloat(revenueResult?.dataValues?.total || 0)
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get attendance trend (last 7 days)
router.get('/attendance-trend', async (req, res) => {
  try {
    const { Attendance } = require('../models');
    
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const attendanceData = await Attendance.findAll({
      attributes: [
        'date',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('COUNT', sequelize.literal("CASE WHEN status = 'present' THEN 1 END")), 'present'],
        [sequelize.fn('COUNT', sequelize.literal("CASE WHEN status = 'absent' THEN 1 END")), 'absent'],
        [sequelize.fn('COUNT', sequelize.literal("CASE WHEN status = 'late' THEN 1 END")), 'late']
      ],
      where: {
        company_id: req.companyId,
        date: {
          [require('sequelize').Op.gte]: sevenDaysAgo
        }
      },
      group: ['date'],
      order: [['date', 'ASC']]
    });

    res.json({ success: true, data: { attendance_trend: attendanceData } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get sales trend (last 30 days)
router.get('/sales-trend', async (req, res) => {
  try {
    const { Order } = require('../models');
    const { sequelize } = require('../models');
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const salesData = await Order.findAll({
      attributes: [
        [sequelize.fn('DATE', sequelize.col('order_date')), 'date'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'orders'],
        [sequelize.fn('SUM', sequelize.col('total_amount')), 'revenue']
      ],
      where: {
        company_id: req.companyId,
        order_date: {
          [require('sequelize').Op.gte]: thirtyDaysAgo
        },
        status: ['approved', 'delivered']
      },
      group: [sequelize.fn('DATE', sequelize.col('order_date'))],
      order: [[sequelize.fn('DATE', sequelize.col('order_date')), 'ASC']]
    });

    res.json({ success: true, data: { sales_trend: salesData } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get top performers
router.get('/top-performers', async (req, res) => {
  try {
    const { User, Visit, Order } = require('../models');
    const { sequelize } = require('../models');
    
    console.log('[DASHBOARD] Models loaded:', { User: !!User, Visit: !!Visit, Order: !!Order });
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const performers = await User.findAll({
      attributes: [
        'id',
        'first_name',
        'last_name',
        [sequelize.fn('COUNT', sequelize.col('visits.id')), 'visits_count'],
        [sequelize.fn('COALESCE', sequelize.fn('SUM', sequelize.col('orders.total_amount')), 0), 'revenue']
      ],
      where: {
        company_id: req.companyId,
        role: 'employee',
        is_active: true,
        is_deleted: false
      },
      include: [
        {
          model: Visit,
          as: 'visits',
          attributes: [],
          where: {
            status: 'completed',
            end_time: {
              [require('sequelize').Op.gte]: thirtyDaysAgo
            }
          },
          required: false
        },
        {
          model: Order,
          as: 'orders',
          attributes: [],
          where: {
            status: ['approved', 'delivered'],
            order_date: {
              [require('sequelize').Op.gte]: thirtyDaysAgo
            }
          },
          required: false
        }
      ],
      group: ['User.id'],
      order: [[sequelize.literal('revenue'), 'DESC']],
      limit: 10
    });

    res.json({ success: true, data: { top_performers: performers } });
  } catch (error) {
    console.error('[DASHBOARD] Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
