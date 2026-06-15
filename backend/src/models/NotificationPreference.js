const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const NotificationPreference = sequelize.define('NotificationPreference', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  task_assigned: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  attendance_missing: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  geofence_entry: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  geofence_exit: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  expense_approved: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  expense_rejected: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  leave_approved: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  leave_rejected: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  order_created: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  visit_completed: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  push_enabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  sms_enabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  email_enabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'notification_preferences',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { unique: true, fields: ['user_id'] }
  ]
});

module.exports = NotificationPreference;
