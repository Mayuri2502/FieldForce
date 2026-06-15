const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  company_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'companies',
      key: 'id'
    }
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  type: {
    type: DataTypes.ENUM('task_assigned', 'attendance_missing', 'geofence_entry', 'geofence_exit', 'expense_approved', 'expense_rejected', 'leave_approved', 'leave_rejected', 'order_created', 'visit_completed'),
    allowNull: false
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  data: {
    type: DataTypes.JSON,
    defaultValue: {}
  },
  channels: {
    type: DataTypes.TEXT,
    defaultValue: 'in_app',
    get() {
      const rawValue = this.getDataValue('channels');
      return rawValue ? rawValue.split(',') : ['in_app'];
    },
    set(value) {
      this.setDataValue('channels', Array.isArray(value) ? value.join(',') : value);
    }
  },
  is_read: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  read_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  sent_push: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  sent_sms: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  sent_email: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'notifications',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  indexes: [
    { fields: ['user_id'] },
    { fields: ['is_read'] },
    { fields: ['created_at'] }
  ]
});

module.exports = Notification;
