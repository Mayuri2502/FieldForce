const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Attendance = sequelize.define('Attendance', {
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
  company_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'companies',
      key: 'id'
    }
  },
  shift_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'shifts',
      key: 'id'
    }
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  check_in_time: {
    type: DataTypes.DATE,
    allowNull: false
  },
  check_out_time: {
    type: DataTypes.DATE,
    allowNull: true
  },
  check_in_latitude: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: true
  },
  check_in_longitude: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: true
  },
  check_in_accuracy: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  check_out_latitude: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: true
  },
  check_out_longitude: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: true
  },
  check_out_accuracy: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  check_in_selfie_url: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  check_in_device_info: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  check_out_device_info: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  work_hours: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true
  },
  overtime_hours: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('present', 'absent', 'late', 'early_exit', 'half_day'),
    allowNull: false,
    defaultValue: 'present'
  },
  is_late: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  late_minutes: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  is_early_exit: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  early_exit_minutes: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  selfie_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  selfie_verification_score: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'attendance',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { fields: ['employee_id'] },
    { fields: ['company_id'] },
    { fields: ['date'] },
    { fields: ['status'] },
    { unique: true, fields: ['employee_id', 'date'] }
  ]
});

module.exports = Attendance;
