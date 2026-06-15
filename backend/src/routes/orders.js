const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

// Get orders
router.get('/', async (req, res) => {
  try {
    const { Order } = require('../models');
    const { status, customer_id, employee_id, date_from, date_to } = req.query;
    
    const where = { company_id: req.companyId };
    if (status) where.status = status;
    if (customer_id) where.customer_id = customer_id;
    if (employee_id) where.employee_id = employee_id;
    if (date_from && date_to) {
      where.order_date = {
        [require('sequelize').Op.between]: [new Date(date_from), new Date(date_to)]
      };
    }

    const orders = await Order.findAll({
      where,
      include: [
        { model: require('../models').User, as: 'employee' },
        { model: require('../models').Customer, as: 'customer' },
        { model: require('../models').OrderItem, as: 'items' }
      ],
      order: [['order_date', 'DESC']]
    });

    res.json({ success: true, data: { orders } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create order
router.post('/', async (req, res) => {
  try {
    const { Order, OrderItem } = require('../models');
    const { items, ...orderData } = req.body;

    const order = await Order.create({
      ...orderData,
      company_id: req.companyId,
      employee_id: req.user.id,
      order_number: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`
    });

    // Create order items
    if (items && items.length > 0) {
      await OrderItem.bulkCreate(
        items.map(item => ({
          order_id: order.id,
          ...item
        }))
      );
    }

    // Recalculate totals
    const orderWithItems = await Order.findByPk(order.id, { include: [{ model: OrderItem, as: 'items' }] });
    let subtotal = 0;
    orderWithItems.items.forEach(item => {
      subtotal += item.total_amount;
    });
    orderWithItems.subtotal = subtotal;
    orderWithItems.total_amount = subtotal - (orderWithItems.discount_amount || 0) + (orderWithItems.tax_amount || 0);
    await orderWithItems.save();

    res.status(201).json({ success: true, data: { order: orderWithItems } });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Get order by ID
router.get('/:id', async (req, res) => {
  try {
    const { Order } = require('../models');
    const order = await Order.findByPk(req.params.id, {
      include: [
        { model: require('../models').User, as: 'employee' },
        { model: require('../models').Customer, as: 'customer' },
        { model: require('../models').OrderItem, as: 'items' }
      ]
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.json({ success: true, data: { order } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update order
router.put('/:id', async (req, res) => {
  try {
    const { Order } = require('../models');
    const order = await Order.findByPk(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    Object.assign(order, req.body);
    await order.save();

    res.json({ success: true, data: { order } });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

module.exports = router;
