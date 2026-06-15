const { Sequelize } = require('sequelize');
const sequelize = require('../config/database');

const User = require('./User');
const Company = require('./Company');
const Session = require('./Session');
const Territory = require('./Territory');
const Geofence = require('./Geofence');
const Shift = require('./Shift');
const EmployeeShift = require('./EmployeeShift');
const Attendance = require('./Attendance');
const LocationHistory = require('./LocationHistory');
const GeofenceEvent = require('./GeofenceEvent');
const Task = require('./Task');
const TaskComment = require('./TaskComment');
const Customer = require('./Customer');
const CustomerHistory = require('./CustomerHistory');
const FollowUp = require('./FollowUp');
const Visit = require('./Visit');
const Product = require('./Product');
const Order = require('./Order');
const OrderItem = require('./OrderItem');
const Beat = require('./Beat');
const BeatCustomer = require('./BeatCustomer');
const DailyRoute = require('./DailyRoute');
const Expense = require('./Expense');
const Leave = require('./Leave');
const LeaveBalance = require('./LeaveBalance');
const Form = require('./Form');
const FormSubmission = require('./FormSubmission');
const Notification = require('./Notification');
const NotificationPreference = require('./NotificationPreference');
const DeviceStatus = require('./DeviceStatus');
const DeviceAlert = require('./DeviceAlert');
const Subscription = require('./Subscription');
const Invoice = require('./Invoice');
const AnalyticsCache = require('./AnalyticsCache');
const Report = require('./Report');
const AuditLog = require('./AuditLog');

// Define associations
const models = {
  User,
  Company,
  Session,
  Territory,
  Geofence,
  Shift,
  EmployeeShift,
  Attendance,
  LocationHistory,
  GeofenceEvent,
  Task,
  TaskComment,
  Customer,
  CustomerHistory,
  FollowUp,
  Visit,
  Product,
  Order,
  OrderItem,
  Beat,
  BeatCustomer,
  DailyRoute,
  Expense,
  Leave,
  LeaveBalance,
  Form,
  FormSubmission,
  Notification,
  NotificationPreference,
  DeviceStatus,
  DeviceAlert,
  Subscription,
  Invoice,
  AnalyticsCache,
  Report,
  AuditLog
};

// Company associations
Company.hasMany(User, { foreignKey: 'company_id', as: 'users' });
Company.hasMany(Territory, { foreignKey: 'company_id', as: 'territories' });
Company.hasMany(Geofence, { foreignKey: 'company_id', as: 'geofences' });
Company.hasMany(Shift, { foreignKey: 'company_id', as: 'shifts' });
Company.hasMany(Attendance, { foreignKey: 'company_id', as: 'attendance' });
Company.hasMany(LocationHistory, { foreignKey: 'company_id', as: 'locationHistory' });
Company.hasMany(GeofenceEvent, { foreignKey: 'company_id', as: 'geofenceEvents' });
Company.hasMany(Task, { foreignKey: 'company_id', as: 'tasks' });
Company.hasMany(Customer, { foreignKey: 'company_id', as: 'customers' });
Company.hasMany(Visit, { foreignKey: 'company_id', as: 'visits' });
Company.hasMany(Product, { foreignKey: 'company_id', as: 'products' });
Company.hasMany(Order, { foreignKey: 'company_id', as: 'orders' });
Company.hasMany(Beat, { foreignKey: 'company_id', as: 'beats' });
Company.hasMany(Expense, { foreignKey: 'company_id', as: 'expenses' });
Company.hasMany(Leave, { foreignKey: 'company_id', as: 'leaves' });
Company.hasMany(Form, { foreignKey: 'company_id', as: 'forms' });
Company.hasMany(Notification, { foreignKey: 'company_id', as: 'notifications' });
Company.hasMany(DeviceAlert, { foreignKey: 'company_id', as: 'deviceAlerts' });
Company.hasMany(Subscription, { foreignKey: 'company_id', as: 'subscriptions' });
Company.hasMany(Invoice, { foreignKey: 'company_id', as: 'invoices' });
Company.hasMany(AnalyticsCache, { foreignKey: 'company_id', as: 'analyticsCache' });
Company.hasMany(Report, { foreignKey: 'company_id', as: 'reports' });
Company.hasMany(AuditLog, { foreignKey: 'company_id', as: 'auditLogs' });

// User associations
User.belongsTo(Company, { foreignKey: 'company_id', as: 'company' });
User.belongsTo(User, { foreignKey: 'manager_id', as: 'manager' });
User.hasMany(User, { foreignKey: 'manager_id', as: 'subordinates' });
User.hasMany(Session, { foreignKey: 'user_id', as: 'sessions' });
User.hasMany(Attendance, { foreignKey: 'employee_id', as: 'attendance' });
User.hasMany(LocationHistory, { foreignKey: 'employee_id', as: 'locationHistory' });
User.hasMany(GeofenceEvent, { foreignKey: 'employee_id', as: 'geofenceEvents' });
User.hasMany(Task, { foreignKey: 'assigned_by', as: 'assignedTasks' });
User.hasMany(Task, { foreignKey: 'assigned_to', as: 'receivedTasks' });
User.hasMany(Customer, { foreignKey: 'assigned_employee_id', as: 'assignedCustomers' });
User.hasMany(Visit, { foreignKey: 'employee_id', as: 'visits' });
User.hasMany(Order, { foreignKey: 'employee_id', as: 'orders' });
User.hasMany(Beat, { foreignKey: 'assigned_employee_id', as: 'assignedBeats' });
User.hasMany(DailyRoute, { foreignKey: 'employee_id', as: 'dailyRoutes' });
User.hasMany(Expense, { foreignKey: 'employee_id', as: 'expenses' });
User.hasMany(Leave, { foreignKey: 'employee_id', as: 'leaves' });
User.hasMany(LeaveBalance, { foreignKey: 'employee_id', as: 'leaveBalances' });
User.hasMany(FormSubmission, { foreignKey: 'employee_id', as: 'formSubmissions' });
User.hasMany(Notification, { foreignKey: 'user_id', as: 'notifications' });
User.hasOne(NotificationPreference, { foreignKey: 'user_id', as: 'notificationPreferences' });
User.hasOne(DeviceStatus, { foreignKey: 'employee_id', as: 'deviceStatus' });
User.hasMany(DeviceAlert, { foreignKey: 'employee_id', as: 'deviceAlerts' });
User.hasMany(AuditLog, { foreignKey: 'user_id', as: 'auditLogs' });

// Territory associations
Territory.belongsTo(Company, { foreignKey: 'company_id', as: 'company' });
Territory.belongsTo(User, { foreignKey: 'manager_id', as: 'manager' });
Territory.hasMany(Geofence, { foreignKey: 'territory_id', as: 'geofences' });
Territory.hasMany(Task, { foreignKey: 'territory_id', as: 'tasks' });
Territory.hasMany(Customer, { foreignKey: 'territory_id', as: 'customers' });
Territory.hasMany(Beat, { foreignKey: 'territory_id', as: 'beats' });

// Geofence associations
Geofence.belongsTo(Company, { foreignKey: 'company_id', as: 'company' });
Geofence.belongsTo(Territory, { foreignKey: 'territory_id', as: 'territory' });
Geofence.hasMany(GeofenceEvent, { foreignKey: 'geofence_id', as: 'events' });

// Shift associations
Shift.belongsTo(Company, { foreignKey: 'company_id', as: 'company' });
Shift.hasMany(EmployeeShift, { foreignKey: 'shift_id', as: 'employeeShifts' });
Shift.hasMany(Attendance, { foreignKey: 'shift_id', as: 'attendance' });

// EmployeeShift associations
EmployeeShift.belongsTo(User, { foreignKey: 'employee_id', as: 'employee' });
EmployeeShift.belongsTo(Shift, { foreignKey: 'shift_id', as: 'shift' });

// Attendance associations
Attendance.belongsTo(User, { foreignKey: 'employee_id', as: 'employee' });
Attendance.belongsTo(Company, { foreignKey: 'company_id', as: 'company' });
Attendance.belongsTo(Shift, { foreignKey: 'shift_id', as: 'shift' });

// LocationHistory associations
LocationHistory.belongsTo(User, { foreignKey: 'employee_id', as: 'employee' });
LocationHistory.belongsTo(Company, { foreignKey: 'company_id', as: 'company' });

// GeofenceEvent associations
GeofenceEvent.belongsTo(User, { foreignKey: 'employee_id', as: 'employee' });
GeofenceEvent.belongsTo(Company, { foreignKey: 'company_id', as: 'company' });
GeofenceEvent.belongsTo(Geofence, { foreignKey: 'geofence_id', as: 'geofence' });

// Task associations
Task.belongsTo(Company, { foreignKey: 'company_id', as: 'company' });
Task.belongsTo(User, { foreignKey: 'assigned_by', as: 'assigner' });
Task.belongsTo(User, { foreignKey: 'assigned_to', as: 'assignee' });
Task.belongsTo(Territory, { foreignKey: 'territory_id', as: 'territory' });
Task.belongsTo(Customer, { foreignKey: 'customer_id', as: 'customer' });
Task.hasMany(TaskComment, { foreignKey: 'task_id', as: 'comments' });
Task.hasMany(Visit, { foreignKey: 'task_id', as: 'visits' });

// TaskComment associations
TaskComment.belongsTo(Task, { foreignKey: 'task_id', as: 'task' });
TaskComment.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Customer associations
Customer.belongsTo(Company, { foreignKey: 'company_id', as: 'company' });
Customer.belongsTo(Territory, { foreignKey: 'territory_id', as: 'territory' });
Customer.belongsTo(User, { foreignKey: 'assigned_employee_id', as: 'assignedEmployee' });
Customer.hasMany(CustomerHistory, { foreignKey: 'customer_id', as: 'history' });
Customer.hasMany(FollowUp, { foreignKey: 'customer_id', as: 'followUps' });
Customer.hasMany(Visit, { foreignKey: 'customer_id', as: 'visits' });
Customer.hasMany(Order, { foreignKey: 'customer_id', as: 'orders' });

// CustomerHistory associations
CustomerHistory.belongsTo(Customer, { foreignKey: 'customer_id', as: 'customer' });
CustomerHistory.belongsTo(User, { foreignKey: 'employee_id', as: 'employee' });

// FollowUp associations
FollowUp.belongsTo(Customer, { foreignKey: 'customer_id', as: 'customer' });
FollowUp.belongsTo(User, { foreignKey: 'employee_id', as: 'employee' });

// Visit associations
Visit.belongsTo(Company, { foreignKey: 'company_id', as: 'company' });
Visit.belongsTo(User, { foreignKey: 'employee_id', as: 'employee' });
Visit.belongsTo(Customer, { foreignKey: 'customer_id', as: 'customer' });
Visit.belongsTo(Task, { foreignKey: 'task_id', as: 'task' });

// Product associations
Product.belongsTo(Company, { foreignKey: 'company_id', as: 'company' });
Product.hasMany(OrderItem, { foreignKey: 'product_id', as: 'orderItems' });

// Order associations
Order.belongsTo(Company, { foreignKey: 'company_id', as: 'company' });
Order.belongsTo(User, { foreignKey: 'employee_id', as: 'employee' });
Order.belongsTo(Customer, { foreignKey: 'customer_id', as: 'customer' });
Order.hasMany(OrderItem, { foreignKey: 'order_id', as: 'items' });

// OrderItem associations
OrderItem.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });
OrderItem.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

// Beat associations
Beat.belongsTo(Company, { foreignKey: 'company_id', as: 'company' });
Beat.belongsTo(Territory, { foreignKey: 'territory_id', as: 'territory' });
Beat.belongsTo(User, { foreignKey: 'assigned_employee_id', as: 'assignedEmployee' });
Beat.belongsTo(User, { foreignKey: 'manager_id', as: 'manager' });
Beat.hasMany(BeatCustomer, { foreignKey: 'beat_id', as: 'beatCustomers' });
Beat.hasMany(DailyRoute, { foreignKey: 'beat_id', as: 'dailyRoutes' });

// BeatCustomer associations
BeatCustomer.belongsTo(Beat, { foreignKey: 'beat_id', as: 'beat' });
BeatCustomer.belongsTo(Customer, { foreignKey: 'customer_id', as: 'customer' });

// DailyRoute associations
DailyRoute.belongsTo(User, { foreignKey: 'employee_id', as: 'employee' });
DailyRoute.belongsTo(Beat, { foreignKey: 'beat_id', as: 'beat' });

// Expense associations
Expense.belongsTo(Company, { foreignKey: 'company_id', as: 'company' });
Expense.belongsTo(User, { foreignKey: 'employee_id', as: 'employee' });
Expense.belongsTo(User, { foreignKey: 'approved_by', as: 'approver' });
Expense.belongsTo(User, { foreignKey: 'rejected_by', as: 'rejecter' });

// Leave associations
Leave.belongsTo(Company, { foreignKey: 'company_id', as: 'company' });
Leave.belongsTo(User, { foreignKey: 'employee_id', as: 'employee' });
Leave.belongsTo(User, { foreignKey: 'approved_by', as: 'approver' });
Leave.belongsTo(User, { foreignKey: 'rejected_by', as: 'rejecter' });

// LeaveBalance associations
LeaveBalance.belongsTo(User, { foreignKey: 'employee_id', as: 'employee' });

// Form associations
Form.belongsTo(Company, { foreignKey: 'company_id', as: 'company' });
Form.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });
Form.hasMany(FormSubmission, { foreignKey: 'form_id', as: 'submissions' });

// FormSubmission associations
FormSubmission.belongsTo(Form, { foreignKey: 'form_id', as: 'form' });
FormSubmission.belongsTo(User, { foreignKey: 'employee_id', as: 'employee' });
FormSubmission.belongsTo(Customer, { foreignKey: 'customer_id', as: 'customer' });
FormSubmission.belongsTo(Task, { foreignKey: 'task_id', as: 'task' });

// Notification associations
Notification.belongsTo(Company, { foreignKey: 'company_id', as: 'company' });
Notification.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// NotificationPreference associations
NotificationPreference.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// DeviceStatus associations
DeviceStatus.belongsTo(User, { foreignKey: 'employee_id', as: 'employee' });
DeviceStatus.hasMany(DeviceAlert, { foreignKey: 'employee_id', as: 'alerts' });

// DeviceAlert associations
DeviceAlert.belongsTo(User, { foreignKey: 'employee_id', as: 'employee' });
DeviceAlert.belongsTo(Company, { foreignKey: 'company_id', as: 'company' });

// Subscription associations
Subscription.belongsTo(Company, { foreignKey: 'company_id', as: 'company' });
Subscription.hasMany(Invoice, { foreignKey: 'subscription_id', as: 'invoices' });

// Invoice associations
Invoice.belongsTo(Company, { foreignKey: 'company_id', as: 'company' });
Invoice.belongsTo(Subscription, { foreignKey: 'subscription_id', as: 'subscription' });

// AnalyticsCache associations
AnalyticsCache.belongsTo(Company, { foreignKey: 'company_id', as: 'company' });

// Report associations
Report.belongsTo(Company, { foreignKey: 'company_id', as: 'company' });
Report.belongsTo(User, { foreignKey: 'generated_by', as: 'generator' });

// AuditLog associations
AuditLog.belongsTo(Company, { foreignKey: 'company_id', as: 'company' });
AuditLog.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

module.exports = { sequelize, ...models };
