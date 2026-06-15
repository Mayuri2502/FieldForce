const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Geofence = sequelize.define('Geofence', {
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
  territory_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'territories',
      key: 'id'
    }
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('radius', 'polygon'),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  latitude: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: true
  },
  longitude: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: true
  },
  radius_meters: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  polygon_coordinates: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  entry_alert_enabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  exit_alert_enabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'geofences',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Geofence;
