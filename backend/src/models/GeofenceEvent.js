const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const GeofenceEvent = sequelize.define('GeofenceEvent', {
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
  geofence_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'geofences',
      key: 'id'
    }
  },
  event_type: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  latitude: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: true
  },
  longitude: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: true
  },
  timestamp: {
    type: DataTypes.DATE,
    allowNull: false
  }
}, {
  tableName: 'geofence_events',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  indexes: [
    { fields: ['employee_id'] },
    { fields: ['timestamp'] }
  ]
});

module.exports = GeofenceEvent;
