const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DailyRoute = sequelize.define('DailyRoute', {
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
  beat_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'beats',
      key: 'id'
    }
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  planned_route: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  actual_route: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  total_distance_km: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  total_duration_minutes: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  start_time: {
    type: DataTypes.DATE,
    allowNull: true
  },
  end_time: {
    type: DataTypes.DATE,
    allowNull: true
  },
  status: {
    type: DataTypes.STRING(50),
    defaultValue: 'planned'
  }
}, {
  tableName: 'daily_routes',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { unique: true, fields: ['employee_id', 'date'] }
  ]
});

module.exports = DailyRoute;
