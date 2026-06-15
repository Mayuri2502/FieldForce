const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Task = sequelize.define('Task', {
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
  assigned_by: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  assigned_to: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
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
  customer_id: {
    type: DataTypes.UUID,
    allowNull: true
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  type: {
    type: DataTypes.ENUM('visit', 'meeting', 'survey', 'collection', 'service_request'),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'assigned', 'in_progress', 'completed', 'cancelled'),
    allowNull: false,
    defaultValue: 'pending'
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
    allowNull: false,
    defaultValue: 'medium'
  },
  due_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  start_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  completion_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  estimated_duration_minutes: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  actual_duration_minutes: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  location_latitude: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: true
  },
  location_longitude: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: true
  },
  location_address: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  attachments: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  completion_proof_url: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  completion_notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  completion_images: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {}
  }
}, {
  tableName: 'tasks',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { fields: ['assigned_to'] },
    { fields: ['company_id'] },
    { fields: ['status'] },
    { fields: ['due_date'] }
  ]
});

module.exports = Task;
