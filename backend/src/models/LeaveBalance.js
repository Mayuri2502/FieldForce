const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const LeaveBalance = sequelize.define('LeaveBalance', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  employee_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  leave_type: {
    type: DataTypes.ENUM('casual', 'sick', 'paid', 'unpaid'),
    allowNull: false
  },
  year: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  total_days: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false
  },
  used_days: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0
  },
  remaining_days: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false
  }
}, {
  tableName: 'leave_balance',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { unique: true, fields: ['employee_id', 'leave_type', 'year'] }
  ]
});

module.exports = LeaveBalance;
