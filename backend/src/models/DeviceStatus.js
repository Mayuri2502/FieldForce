const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DeviceStatus = sequelize.define('DeviceStatus', {
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
  device_model: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  os_version: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  app_version: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  battery_level: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  is_charging: {
    type: DataTypes.BOOLEAN,
    allowNull: true
  },
  network_type: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  network_strength: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  gps_enabled: {
    type: DataTypes.BOOLEAN,
    allowNull: true
  },
  gps_accuracy: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  storage_used_mb: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  storage_total_mb: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('online', 'offline', 'battery_low', 'gps_disabled', 'app_closed'),
    allowNull: false,
    defaultValue: 'online'
  },
  last_location_latitude: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: true
  },
  last_location_longitude: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: true
  },
  last_location_time: {
    type: DataTypes.DATE,
    allowNull: true
  },
  last_active_time: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'device_status',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = DeviceStatus;
