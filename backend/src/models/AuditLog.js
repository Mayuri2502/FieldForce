const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AuditLog = sequelize.define('AuditLog', {
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
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  action: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  entity_type: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  entity_id: {
    type: DataTypes.UUID,
    allowNull: true
  },
  old_values: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  new_values: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  ip_address: {
    type: DataTypes.INET,
    allowNull: true
  },
  user_agent: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'audit_logs',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  indexes: [
    { fields: ['company_id'] },
    { fields: ['user_id'] },
    { fields: ['entity_type', 'entity_id'] },
    { fields: ['created_at'] }
  ]
});

module.exports = AuditLog;
