const bcrypt = require('bcryptjs');
const { sequelize, User, Company, Visit, Task, Customer, Product, Order, OrderItem, Expense, Leave, LeaveBalance, Attendance, LocationHistory, Notification, Territory, Geofence, Shift, EmployeeShift, Report } = require('../models');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Import all models to ensure they are synced
require('../models');

const seedDatabase = async () => {
  try {
    console.log('Starting database seed...');

    // Delete existing database file if it exists
    const dbPath = process.env.DB_PATH || path.join(process.cwd(), 'database.sqlite');
    if (fs.existsSync(dbPath)) {
      console.log('Deleting existing database file:', dbPath);
      fs.unlinkSync(dbPath);
    }

    // Sync database
    await sequelize.sync({ force: true });
    console.log('Database synchronized');

    // Explicitly sync Visit model to ensure it's created
    await Visit.sync({ force: true });
    console.log('Visit model synchronized');

    // Create company
    const company = await Company.create({
      name: 'Acme Corporation',
      industry: 'Technology',
      website: 'https://acme.com',
      address: '123 Business Street, City, Country',
      phone: '+1 234 567 890',
      email: 'info@acme.com',
      subscription_plan: 'enterprise',
      subscription_status: 'active',
    });
    console.log('Company created:', company.name);

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const adminUser = await User.create({
      company_id: company.id,
      first_name: 'Admin',
      last_name: 'User',
      email: 'admin@fieldforcepro.com',
      password_hash: hashedPassword,
      phone: '+1 234 567 890',
      role: 'company_admin',
      is_active: true,
      email_verified: true,
    });
    console.log('Admin user created:', adminUser.email);

    // Create manager user
    const managerPassword = await bcrypt.hash('manager123', 10);
    const managerUser = await User.create({
      company_id: company.id,
      first_name: 'John',
      last_name: 'Manager',
      email: 'manager@fieldforcepro.com',
      password_hash: managerPassword,
      phone: '+1 234 567 891',
      role: 'manager',
      is_active: true,
      email_verified: true,
    });
    console.log('Manager user created:', managerUser.email);

    // Create field employee user
    const employeePassword = await bcrypt.hash('employee123', 10);
    const employeeUser = await User.create({
      company_id: company.id,
      manager_id: managerUser.id,
      first_name: 'Jane',
      last_name: 'Employee',
      email: 'employee@fieldforcepro.com',
      password_hash: employeePassword,
      phone: '+1 234 567 892',
      role: 'employee',
      is_active: true,
      email_verified: true,
    });
    console.log('Field employee user created:', employeeUser.email);

    // Create territories
    const territory1 = await Territory.create({
      company_id: company.id,
      manager_id: managerUser.id,
      name: 'North Territory',
      description: 'Northern sales territory',
      boundaries: JSON.stringify({ type: 'Polygon', coordinates: [[[0, 0], [0, 10], [10, 10], [10, 0], [0, 0]]] }),
    });
    console.log('Territory created:', territory1.name);

    // Create geofences
    const geofence1 = await Geofence.create({
      company_id: company.id,
      territory_id: territory1.id,
      name: 'Office Geofence',
      type: 'circle',
      coordinates: JSON.stringify({ center: [40.7128, -74.0060], radius: 500 }),
      is_active: true,
    });
    console.log('Geofence created:', geofence1.name);

    // Create shifts
    const shift1 = await Shift.create({
      company_id: company.id,
      name: 'Morning Shift',
      type: 'morning',
      start_time: '09:00:00',
      end_time: '17:00:00',
      break_duration_minutes: 60,
      is_rotational: false,
    });
    console.log('Shift created:', shift1.name);

    // Assign employee to shift
    await EmployeeShift.create({
      employee_id: employeeUser.id,
      shift_id: shift1.id,
      effective_date: new Date(),
    });
    console.log('Employee assigned to shift');

    // Create products
    const product1 = await Product.create({
      company_id: company.id,
      name: 'Widget A',
      sku: 'WGT-001',
      description: 'High-quality widget',
      price: 99.99,
      cost: 50.00,
      stock_quantity: 100,
      is_active: true,
    });
    const product2 = await Product.create({
      company_id: company.id,
      name: 'Widget B',
      sku: 'WGT-002',
      description: 'Premium widget',
      price: 149.99,
      cost: 75.00,
      stock_quantity: 50,
      is_active: true,
    });
    console.log('Products created');

    // Create customers
    const customer1 = await Customer.create({
      company_id: company.id,
      territory_id: territory1.id,
      assigned_employee_id: employeeUser.id,
      name: 'ABC Corporation',
      contact_person: 'John Smith',
      phone: '+1 555 123 4567',
      email: 'john@abc.com',
      address: '456 Customer Ave, Business City',
      latitude: 40.7128,
      longitude: -74.0060,
      customer_type: 'enterprise',
      status: 'active',
    });
    const customer2 = await Customer.create({
      company_id: company.id,
      territory_id: territory1.id,
      assigned_employee_id: employeeUser.id,
      name: 'XYZ Industries',
      contact_person: 'Jane Doe',
      phone: '+1 555 987 6543',
      email: 'jane@xyz.com',
      address: '789 Industrial Blvd, Tech Town',
      latitude: 40.7589,
      longitude: -73.9851,
      customer_type: 'sme',
      status: 'active',
    });
    console.log('Customers created');

    // Create tasks
    const task1 = await Task.create({
      company_id: company.id,
      territory_id: territory1.id,
      assigned_by: managerUser.id,
      assigned_to: employeeUser.id,
      title: 'Follow up with ABC Corporation',
      description: 'Discuss new product offerings',
      type: 'visit',
      priority: 'high',
      status: 'in_progress',
      due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      completion_date: null,
    });
    const task2 = await Task.create({
      company_id: company.id,
      territory_id: territory1.id,
      assigned_by: managerUser.id,
      assigned_to: employeeUser.id,
      title: 'Product demo at XYZ Industries',
      description: 'Demonstrate new widget features',
      type: 'meeting',
      priority: 'medium',
      status: 'pending',
      due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      completion_date: null,
    });
    console.log('Tasks created');

    // Create visits
    const visit1 = await Visit.create({
      company_id: company.id,
      employee_id: employeeUser.id,
      customer_id: customer1.id,
      task_id: task1.id,
      type: 'sales',
      status: 'completed',
      scheduled_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      start_time: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      end_time: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
      start_latitude: 40.7128,
      start_longitude: -74.0060,
      end_latitude: 40.7128,
      end_longitude: -74.0060,
      duration_minutes: 120,
      purpose: 'Product presentation',
      outcome: 'Successful - customer interested',
      notes: 'Customer showed interest in Widget A',
      is_productive: true,
    });
    const visit2 = await Visit.create({
      company_id: company.id,
      employee_id: employeeUser.id,
      customer_id: customer2.id,
      task_id: task2.id,
      type: 'follow_up',
      status: 'scheduled',
      scheduled_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      purpose: 'Product demo',
      notes: 'Prepare demo materials',
    });
    console.log('Visits created');

    // Create orders
    const order1 = await Order.create({
      company_id: company.id,
      employee_id: employeeUser.id,
      customer_id: customer1.id,
      order_number: 'ORD-001',
      order_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      subtotal: 299.97,
      total_amount: 299.97,
      status: 'approved',
      notes: 'Bulk order for Widget A',
    });
    await OrderItem.create({
      order_id: order1.id,
      product_id: product1.id,
      product_name: product1.name,
      quantity: 3,
      unit_price: 99.99,
      total_amount: 299.97,
    });
    const order2 = await Order.create({
      company_id: company.id,
      employee_id: employeeUser.id,
      customer_id: customer2.id,
      order_number: 'ORD-002',
      order_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      subtotal: 149.99,
      total_amount: 149.99,
      status: 'delivered',
      notes: 'Single order for Widget B',
    });
    await OrderItem.create({
      order_id: order2.id,
      product_id: product2.id,
      product_name: product2.name,
      quantity: 1,
      unit_price: 149.99,
      total_amount: 149.99,
    });
    console.log('Orders created');

    // Create expenses
    const expense1 = await Expense.create({
      company_id: company.id,
      employee_id: employeeUser.id,
      type: 'travel',
      category: 'fuel',
      amount: 45.50,
      description: 'Fuel for customer visits',
      expense_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      status: 'approved',
      approved_by: managerUser.id,
      approved_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      receipt_url: '/receipts/exp1.jpg',
    });
    const expense2 = await Expense.create({
      company_id: company.id,
      employee_id: employeeUser.id,
      type: 'food',
      category: 'meals',
      amount: 25.00,
      description: 'Client lunch',
      expense_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      status: 'pending',
    });
    console.log('Expenses created');

    // Create leave balance
    const currentYear = new Date().getFullYear();
    await LeaveBalance.create({
      employee_id: employeeUser.id,
      leave_type: 'paid',
      year: currentYear,
      total_days: 20,
      used_days: 0,
      remaining_days: 20,
    });
    await LeaveBalance.create({
      employee_id: employeeUser.id,
      leave_type: 'sick',
      year: currentYear,
      total_days: 10,
      used_days: 0,
      remaining_days: 10,
    });
    await LeaveBalance.create({
      employee_id: employeeUser.id,
      leave_type: 'casual',
      year: currentYear,
      total_days: 5,
      used_days: 0,
      remaining_days: 5,
    });
    console.log('Leave balance created');

    // Create leaves
    const leave1 = await Leave.create({
      company_id: company.id,
      employee_id: employeeUser.id,
      type: 'paid',
      start_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      end_date: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
      total_days: 3,
      reason: 'Family vacation',
      status: 'approved',
      approved_by: managerUser.id,
      approved_at: new Date(),
    });
    console.log('Leave created');

    // Create attendance
    const attendance1 = await Attendance.create({
      company_id: company.id,
      employee_id: employeeUser.id,
      shift_id: shift1.id,
      date: new Date(),
      check_in_time: new Date(Date.now() - 2 * 60 * 60 * 1000),
      check_out_time: null,
      status: 'present',
      work_hours: 2,
    });
    const attendance2 = await Attendance.create({
      company_id: company.id,
      employee_id: employeeUser.id,
      shift_id: shift1.id,
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      check_in_time: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 9 * 60 * 60 * 1000),
      check_out_time: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 17 * 60 * 60 * 1000),
      status: 'present',
      work_hours: 8,
    });
    const attendance3 = await Attendance.create({
      company_id: company.id,
      employee_id: employeeUser.id,
      shift_id: shift1.id,
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      check_in_time: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 9 * 60 * 60 * 1000),
      check_out_time: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 17 * 60 * 60 * 1000),
      status: 'present',
      work_hours: 8,
    });
    const attendance4 = await Attendance.create({
      company_id: company.id,
      employee_id: employeeUser.id,
      shift_id: shift1.id,
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      check_in_time: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 9 * 60 * 60 * 1000),
      check_out_time: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 17 * 60 * 60 * 1000),
      status: 'present',
      work_hours: 8,
    });
    const attendance5 = await Attendance.create({
      company_id: company.id,
      employee_id: employeeUser.id,
      shift_id: shift1.id,
      date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      check_in_time: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000 + 9 * 60 * 60 * 1000),
      check_out_time: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000 + 17 * 60 * 60 * 1000),
      status: 'present',
      work_hours: 8,
    });
    const attendance6 = await Attendance.create({
      company_id: company.id,
      employee_id: employeeUser.id,
      shift_id: shift1.id,
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      check_in_time: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 9 * 60 * 60 * 1000),
      check_out_time: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 17 * 60 * 60 * 1000),
      status: 'present',
      work_hours: 8,
    });
    const attendance7 = await Attendance.create({
      company_id: company.id,
      employee_id: employeeUser.id,
      shift_id: shift1.id,
      date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      check_in_time: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000 + 9 * 60 * 60 * 1000),
      check_out_time: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000 + 17 * 60 * 60 * 1000),
      status: 'present',
      work_hours: 8,
    });
    console.log('Attendance records created');

    // Create location history
    await LocationHistory.create({
      company_id: company.id,
      employee_id: employeeUser.id,
      latitude: 40.7128,
      longitude: -74.0060,
      accuracy: 10.5,
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      battery_level: 85,
    });
    await LocationHistory.create({
      company_id: company.id,
      employee_id: employeeUser.id,
      latitude: 40.7589,
      longitude: -73.9851,
      accuracy: 12.3,
      timestamp: new Date(Date.now() - 10 * 60 * 1000),
      battery_level: 84,
    });
    await LocationHistory.create({
      company_id: company.id,
      employee_id: employeeUser.id,
      latitude: 40.7614,
      longitude: -73.9776,
      accuracy: 8.7,
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      battery_level: 83,
    });
    await LocationHistory.create({
      company_id: company.id,
      employee_id: employeeUser.id,
      latitude: 40.7580,
      longitude: -73.9855,
      accuracy: 11.2,
      timestamp: new Date(Date.now() - 20 * 60 * 1000),
      battery_level: 82,
    });
    await LocationHistory.create({
      company_id: company.id,
      employee_id: employeeUser.id,
      latitude: 40.7505,
      longitude: -73.9934,
      accuracy: 9.8,
      timestamp: new Date(Date.now() - 25 * 60 * 1000),
      battery_level: 81,
    });
    await LocationHistory.create({
      company_id: company.id,
      employee_id: employeeUser.id,
      latitude: 40.7484,
      longitude: -73.9857,
      accuracy: 10.1,
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      battery_level: 80,
    });
    await LocationHistory.create({
      company_id: company.id,
      employee_id: employeeUser.id,
      latitude: 40.7489,
      longitude: -73.9680,
      accuracy: 13.5,
      timestamp: new Date(Date.now() - 35 * 60 * 1000),
      battery_level: 79,
    });
    await LocationHistory.create({
      company_id: company.id,
      employee_id: employeeUser.id,
      latitude: 40.7527,
      longitude: -73.9772,
      accuracy: 7.9,
      timestamp: new Date(Date.now() - 40 * 60 * 1000),
      battery_level: 78,
    });
    await LocationHistory.create({
      company_id: company.id,
      employee_id: employeeUser.id,
      latitude: 40.7614,
      longitude: -73.9776,
      accuracy: 12.4,
      timestamp: new Date(Date.now() - 45 * 60 * 1000),
      battery_level: 77,
    });
    await LocationHistory.create({
      company_id: company.id,
      employee_id: employeeUser.id,
      latitude: 40.7589,
      longitude: -73.9851,
      accuracy: 9.3,
      timestamp: new Date(Date.now() - 50 * 60 * 1000),
      battery_level: 76,
    });
    console.log('Location history created');

    // Create notifications
    await Notification.create({
      company_id: company.id,
      user_id: employeeUser.id,
      type: 'task',
      title: 'New task assigned',
      message: 'You have been assigned a new task: Follow up with ABC Corporation',
      is_read: false,
    });
    await Notification.create({
      company_id: company.id,
      user_id: employeeUser.id,
      type: 'visit',
      title: 'Visit reminder',
      message: 'You have a scheduled visit tomorrow at XYZ Industries',
      is_read: false,
    });
    await Notification.create({
      company_id: company.id,
      user_id: managerUser.id,
      type: 'expense',
      title: 'Expense approval pending',
      message: 'Jane Employee has submitted a new expense for approval',
      is_read: false,
    });
    await Notification.create({
      company_id: company.id,
      user_id: employeeUser.id,
      type: 'visit',
      title: 'Visit completed',
      message: 'Your visit to ABC Corporation has been marked as completed',
      is_read: true,
    });
    await Notification.create({
      company_id: company.id,
      user_id: employeeUser.id,
      type: 'order',
      title: 'New order received',
      message: 'ABC Corporation has placed a new order for Widget A',
      is_read: false,
    });
    await Notification.create({
      company_id: company.id,
      user_id: managerUser.id,
      type: 'leave',
      title: 'Leave request approved',
      message: 'Jane Employee\'s leave request has been approved',
      is_read: true,
    });
    await Notification.create({
      company_id: company.id,
      user_id: employeeUser.id,
      type: 'attendance',
      title: 'Attendance marked',
      message: 'Your attendance for today has been marked successfully',
      is_read: true,
    });
    await Notification.create({
      company_id: company.id,
      user_id: employeeUser.id,
      type: 'task',
      title: 'Task deadline approaching',
      message: 'Task "Product demo at XYZ Industries" is due in 3 days',
      is_read: false,
    });
    await Notification.create({
      company_id: company.id,
      user_id: managerUser.id,
      type: 'performance',
      title: 'Performance report available',
      message: 'Monthly performance report for Jane Employee is now available',
      is_read: false,
    });
    await Notification.create({
      company_id: company.id,
      user_id: employeeUser.id,
      type: 'system',
      title: 'System maintenance',
      message: 'Scheduled system maintenance tonight at 11 PM',
      is_read: false,
    });
    console.log('Notifications created');

    // Create reports
    await Report.create({
      company_id: company.id,
      generated_by: managerUser.id,
      name: 'Monthly Sales Report',
      report_type: 'sales',
      parameters: JSON.stringify({ month: new Date().getMonth() + 1, year: new Date().getFullYear() }),
      status: 'completed',
      generated_at: new Date(),
      file_url: '/reports/monthly_sales_june_2026.pdf',
      file_format: 'pdf',
    });
    await Report.create({
      company_id: company.id,
      generated_by: managerUser.id,
      name: 'Employee Performance Report',
      report_type: 'performance',
      parameters: JSON.stringify({ period: 'monthly', employee_id: employeeUser.id }),
      status: 'completed',
      generated_at: new Date(),
      file_url: '/reports/employee_performance_june_2026.pdf',
      file_format: 'pdf',
    });
    console.log('Reports created');

    console.log('Database seed completed successfully!');
    console.log('\nTest credentials:');
    console.log('Admin: admin@fieldforcepro.com / admin123');
    console.log('Manager: manager@fieldforcepro.com / manager123');
    console.log('Employee: employee@fieldforcepro.com / employee123');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
