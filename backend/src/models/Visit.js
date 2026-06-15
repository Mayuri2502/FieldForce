const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Visit = sequelize.define('Visit', {
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
  employee_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  customer_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'customers',
      key: 'id'
    }
  },
  task_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'tasks',
      key: 'id'
    }
  },
  type: {
    type: DataTypes.ENUM('sales', 'follow_up', 'complaint', 'collection'),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('scheduled', 'in_progress', 'completed', 'cancelled', 'missed'),
    allowNull: false,
    defaultValue: 'scheduled'
  },
  scheduled_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  start_time: {
    type: DataTypes.DATE,
    allowNull: true
  },
  end_time: {
    type: DataTypes.DATE,
    allowNull: true
  },
  start_latitude: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: true
  },
  start_longitude: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: true
  },
  end_latitude: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: true
  },
  end_longitude: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: true
  },
  duration_minutes: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  purpose: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  outcome: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  photos: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  next_follow_up_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  is_productive: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {}
  }
}, {
  tableName: 'visits',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { fields: ['employee_id'] },
    { fields: ['customer_id'] },
    { fields: ['scheduled_date'] },
    { fields: ['status'] }
  ]
});

module.exports = Visit;
