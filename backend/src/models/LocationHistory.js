const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const LocationHistory = sequelize.define('LocationHistory', {
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
  latitude: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: false
  },
  longitude: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: false
  },
  accuracy: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  altitude: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  speed: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  heading: {
    type: DataTypes.DECIMAL(10, 2),
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
  gps_status: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  timestamp: {
    type: DataTypes.DATE,
    allowNull: false
  },
  device_info: {
    type: DataTypes.JSONB,
    defaultValue: {}
  }
}, {
  tableName: 'location_history',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  indexes: [
    { fields: ['employee_id'] },
    { fields: ['timestamp'] }
  ]
});

module.exports = LocationHistory;
