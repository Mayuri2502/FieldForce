const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AnalyticsCache = sequelize.define('AnalyticsCache', {
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
  metric_name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  metric_value: {
    type: DataTypes.JSONB,
    allowNull: false
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  }
}, {
  tableName: 'analytics_cache',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  indexes: [
    { unique: true, fields: ['company_id', 'metric_name', 'date'] }
  ]
});

module.exports = AnalyticsCache;
