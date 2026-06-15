const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const EmployeeShift = sequelize.define('EmployeeShift', {
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
  shift_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'shifts',
      key: 'id'
    }
  },
  effective_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'employee_shifts',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  indexes: [
    { unique: true, fields: ['employee_id', 'effective_date'] }
  ]
});

module.exports = EmployeeShift;
